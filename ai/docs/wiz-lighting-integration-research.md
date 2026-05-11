# WiZ Lighting Integration Research

## Summary

Philips Smart LED Connected by WiZ bulbs are a good fit for the current NOOS lighting handoff.

Best first integration path:

1. Use WiZ local UDP control on port `38899`.
2. Discover bulbs with `getSystemConfig` / `getPilot`.
3. Apply NOOS white-light scenes with `setPilot` using `temp` and `dimming`.
4. Keep `illuminance_lux_target` as a calibration target, not as a direct WiZ command.
5. Add RGB mode later for decorative/planet color scenes, because WiZ full-color bulbs switch between tunable-white mode and RGB mode.

## Sources Checked

- Signify / Philips WiZ data notice says nearly all WiZ products except WiZ Camera expose a local control API and that local access can be disabled with the WiZ app's "Allow local communication" toggle:
  - https://www.usa.lighting.philips.com/consumer/wiz-data-notice
- Official WiZ local control project:
  - https://gitlab.com/wizlighting/wiz-local-control
- Home Assistant WiZ integration documents Wi-Fi/no-bridge setup and the local communication toggle:
  - https://www.home-assistant.io/integrations/wiz/
- pywizlight documents the native UDP methods and examples:
  - https://pypi.org/project/pywizlight/
- openHAB WiZ binding documents the local UDP approach, supported channels, scene IDs, and limitations:
  - https://www.openhab.org/addons/bindings/wiz/
- WiZ Matter compatibility reference:
  - https://faq.wizconnected.com/hc/en/3-wiz/faq/539-matter-compatible-product-list/
  - https://www.wizconnected.com/en-us/explore-wiz/works-with

## Local Discovery Result

Read-only UDP discovery was attempted first with broadcast. Broadcast returned no devices, but direct UDP reads against ARP candidates found four WiZ bulbs on `192.168.123.0/24`.

No state-changing command was sent.

| IP | MAC | Module | Firmware | State | Scene | Temp | Dimming | RSSI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `192.168.123.100` | `9877d5140d5a` | `ESP25_SHRGB_01` | `1.37.0` | on | `12` | `4200K` | `51` | `-72` |
| `192.168.123.102` | `d8a0119fdcf7` | `ESP20_SHRGB_01ABI` | `1.37.0` | on | `12` | `4200K` | `51` | `-77` |
| `192.168.123.112` | `444f8ee85dbc` | `ESP20_SHRGB_01ABI` | `1.37.0` | on | `12` | `4200K` | `51` | `-78` |
| `192.168.123.113` | `9877d5141bc6` | `ESP25_SHRGB_01` | `1.37.0` | on | `12` | `4200K` | `51` | `-78` |

Observed `getPilot` response shape:

```json
{
  "method": "getPilot",
  "env": "pro",
  "result": {
    "mac": "9877d5140d5a",
    "rssi": -72,
    "state": true,
    "sceneId": 12,
    "temp": 4200,
    "dimming": 51
  }
}
```

## WiZ Local UDP Basics

Default port:

```text
UDP 38899
```

Read current state:

```json
{"method":"getPilot","params":{}}
```

Read system/device config:

```json
{"method":"getSystemConfig","params":{}}
```

Set tunable-white scene:

```json
{"method":"setPilot","params":{"state":true,"temp":4200,"dimming":51}}
```

Set RGB scene:

```json
{"method":"setPilot","params":{"state":true,"r":242,"g":216,"b":197,"dimming":38}}
```

Set built-in scene/effect:

```json
{"method":"setPilot","params":{"state":true,"sceneId":12,"speed":100,"dimming":51}}
```

## Important Limitations

- WiZ full-color bulbs operate in either RGB color mode or tunable-white/color-temperature mode. Sending RGB switches to RGB mode; sending `temp` switches to tunable-white mode.
- Dimming commonly clamps at `10-100`.
- WiZ `dimming` is not equal to measured room lux. NOOS `illuminance_lux_target` needs calibration with the bulb model, distance, room reflectance, and optionally a lux meter.
- UDP control does not provide a reliable per-command transition duration. Smooth transitions should be implemented by sending gradual small steps over time, or by routing through Matter/Home Assistant where transition support may be better.
- Local control requires the bulbs to be on the same reachable LAN and WiZ app setting `Allow local communication` enabled.
- Many newer WiZ / Philips Smart LED Connected by WiZ products support Matter, but Matter is not the simplest first path for direct NOOS-generated values.

## NOOS To WiZ Mapping

Existing NOOS lighting output already contains:

- `brightness_percent`
- `cct_kelvin`
- `illuminance_lux_target`
- `primary_hex`
- `secondary_hex`
- `accent_hex`
- `animation_pattern`
- `transition_sec`
- phase durations

Recommended first mapping:

```text
NOOS brightness_percent -> WiZ dimming
NOOS cct_kelvin         -> WiZ temp
NOOS primary_hex        -> WiZ RGB only for decorative mode
NOOS lux target         -> calibration metadata, not direct command
NOOS transition_sec     -> client-side step/ramp scheduler
```

For research-grounded focus/recovery scenes, prefer tunable-white mode:

```json
{"method":"setPilot","params":{"state":true,"temp":4780,"dimming":42}}
```

For decorative planet-color previews, use RGB mode:

```json
{"method":"setPilot","params":{"state":true,"r":242,"g":216,"b":197,"dimming":42}}
```

## Sample NOOS Neptune Output Converted To WiZ

Input used for the sample:

```json
{
  "planet": "Neptune",
  "duration_sec": 90,
  "current_state": {
    "focus_readiness": 0.35,
    "stress_load": 0.74,
    "fatigue_risk": 0.42,
    "relaxation_level": 0.2,
    "cortical_arousal": 0.7,
    "mental_workload": 0.61
  }
}
```

Output:

| Phase | Duration | Transition | Brightness | CCT | Lux Target | WiZ Payload |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `stabilize` | `36s` | `8s` | `42%` | `4780K` | `590 lx` | `{"method":"setPilot","params":{"state":true,"temp":4780,"dimming":42}}` |
| `deepen` | `54s` | `8s` | `38%` | `4580K` | `490 lx` | `{"method":"setPilot","params":{"state":true,"temp":4580,"dimming":38}}` |

## Implementation Recommendation

Add a backend-side WiZ adapter:

```text
NOOS lighting_spec.hardware_handoff.sequence
  -> WiZ adapter
  -> per-bulb UDP setPilot
  -> optional gradual ramp scheduler
```

Suggested Java/Spring API endpoints:

```text
GET  /api/lighting/wiz/discover
GET  /api/lighting/wiz/devices
POST /api/lighting/wiz/test-scene
POST /api/lighting/wiz/apply-plan
```

Safety defaults:

- Discovery and state read are allowed.
- Actual `setPilot` commands should be behind an explicit user action.
- Start with a single bulb or selected group before broadcasting to every bulb.
- Clamp brightness to the existing NOOS limit, currently `10-88`.
- Clamp CCT to `2400-6500K`.
- No rapid flashing.


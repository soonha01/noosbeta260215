# WiZ 조명 연동 조사

## 요약

Philips Smart LED Connected by WiZ 전구는 현재 NOOS 조명 handoff 구조와 잘 맞는다.

가장 단순하고 안전한 1차 연동 경로는 아래와 같다.

1. `38899` 포트의 WiZ local UDP control을 사용한다.
2. `getSystemConfig` / `getPilot`으로 전구를 찾고 현재 상태를 읽는다.
3. NOOS white-light scene은 `setPilot`의 `temp`와 `dimming`으로 적용한다.
4. `illuminance_lux_target`은 직접 WiZ 명령이 아니라 calibration 목표값으로 유지한다.
5. 장식용/행성 색상 scene은 나중에 RGB mode로 추가한다. WiZ full-color 전구는 tunable-white mode와 RGB mode 사이를 전환하기 때문이다.

## 확인한 자료

- Signify / Philips WiZ data notice는 WiZ Camera를 제외한 거의 모든 WiZ 제품이 local control API를 제공하며, WiZ 앱의 "Allow local communication" toggle로 local access를 끌 수 있다고 설명한다.
  - https://www.usa.lighting.philips.com/consumer/wiz-data-notice
- 공식 WiZ local control project:
  - https://gitlab.com/wizlighting/wiz-local-control
- Home Assistant WiZ integration 문서는 Wi-Fi/no-bridge 설정과 local communication toggle을 설명한다.
  - https://www.home-assistant.io/integrations/wiz/
- pywizlight는 native UDP method와 예제를 문서화한다.
  - https://pypi.org/project/pywizlight/
- openHAB WiZ binding은 local UDP 방식, 지원 channel, scene ID, 한계를 설명한다.
  - https://www.openhab.org/addons/bindings/wiz/
- WiZ Matter compatibility 참고:
  - https://faq.wizconnected.com/hc/en/3-wiz/faq/539-matter-compatible-product-list/
  - https://www.wizconnected.com/en-us/explore-wiz/works-with

## 로컬 발견 결과

먼저 broadcast 방식으로 read-only UDP discovery를 시도했다. Broadcast는 장치를 반환하지 않았지만, ARP 후보 IP에 직접 UDP read를 보내자 `192.168.123.0/24` 대역에서 WiZ 전구 4개를 찾았다.

상태를 바꾸는 명령은 보내지 않았다.

| IP | MAC | Module | Firmware | 상태 | Scene | Temp | Dimming | RSSI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `192.168.123.100` | `9877d5140d5a` | `ESP25_SHRGB_01` | `1.37.0` | on | `12` | `4200K` | `51` | `-72` |
| `192.168.123.102` | `d8a0119fdcf7` | `ESP20_SHRGB_01ABI` | `1.37.0` | on | `12` | `4200K` | `51` | `-77` |
| `192.168.123.112` | `444f8ee85dbc` | `ESP20_SHRGB_01ABI` | `1.37.0` | on | `12` | `4200K` | `51` | `-78` |
| `192.168.123.113` | `9877d5141bc6` | `ESP25_SHRGB_01` | `1.37.0` | on | `12` | `4200K` | `51` | `-78` |

관찰한 `getPilot` 응답 형태:

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

## WiZ 로컬 UDP 기본

기본 포트:

```text
UDP 38899
```

현재 상태 읽기:

```json
{"method":"getPilot","params":{}}
```

시스템/장치 설정 읽기:

```json
{"method":"getSystemConfig","params":{}}
```

tunable-white scene 설정:

```json
{"method":"setPilot","params":{"state":true,"temp":4200,"dimming":51}}
```

RGB scene 설정:

```json
{"method":"setPilot","params":{"state":true,"r":242,"g":216,"b":197,"dimming":38}}
```

내장 scene/effect 설정:

```json
{"method":"setPilot","params":{"state":true,"sceneId":12,"speed":100,"dimming":51}}
```

## 중요한 한계

- WiZ full-color 전구는 RGB color mode 또는 tunable-white/color-temperature mode 중 하나로 동작한다. RGB를 보내면 RGB mode로 바뀌고, `temp`를 보내면 tunable-white mode로 바뀐다.
- Dimming은 보통 `10-100` 범위로 clamp된다.
- WiZ `dimming`은 실제 실내 lux 측정값과 같지 않다. NOOS `illuminance_lux_target`은 전구 모델, 거리, 방 반사율, 필요 시 lux meter를 사용해 calibration해야 한다.
- UDP control은 명령별 transition duration을 안정적으로 제공하지 않는다. 부드러운 전환은 작은 step을 시간에 따라 여러 번 보내거나, transition 지원이 더 나을 수 있는 Matter/Home Assistant 경로를 통해 구현해야 한다.
- Local control을 쓰려면 전구가 접근 가능한 같은 LAN에 있어야 하고, WiZ 앱의 `Allow local communication` 설정이 켜져 있어야 한다.
- 최신 WiZ / Philips Smart LED Connected by WiZ 제품 다수는 Matter를 지원하지만, NOOS가 생성한 값을 직접 적용하는 1차 경로로는 Matter가 가장 단순하지 않다.

## NOOS에서 WiZ로 매핑

기존 NOOS 조명 output에는 이미 아래 값이 들어 있다.

- `brightness_percent`
- `cct_kelvin`
- `illuminance_lux_target`
- `primary_hex`
- `secondary_hex`
- `accent_hex`
- `animation_pattern`
- `transition_sec`
- phase durations

권장 1차 mapping:

```text
NOOS brightness_percent -> WiZ dimming
NOOS cct_kelvin         -> WiZ temp
NOOS primary_hex        -> 장식 mode에서만 WiZ RGB로 사용
NOOS lux target         -> 직접 명령이 아니라 calibration metadata
NOOS transition_sec     -> client-side step/ramp scheduler
```

연구 근거가 있는 집중/회복 scene에는 tunable-white mode를 우선 사용한다.

```json
{"method":"setPilot","params":{"state":true,"temp":4780,"dimming":42}}
```

장식용 행성 색상 preview에는 RGB mode를 사용한다.

```json
{"method":"setPilot","params":{"state":true,"r":242,"g":216,"b":197,"dimming":42}}
```

## NOOS 해왕성(Neptune) 출력을 WiZ로 변환한 예시

예시에 사용한 입력:

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

출력:

| 단계 | 길이 | 전환 시간 | 밝기 | CCT | Lux 목표 | WiZ 페이로드 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `stabilize` | `36s` | `8s` | `42%` | `4780K` | `590 lx` | `{"method":"setPilot","params":{"state":true,"temp":4780,"dimming":42}}` |
| `deepen` | `54s` | `8s` | `38%` | `4580K` | `490 lx` | `{"method":"setPilot","params":{"state":true,"temp":4580,"dimming":38}}` |

## 구현 권장안

백엔드 쪽에 WiZ adapter를 추가한다.

```text
NOOS lighting_spec.hardware_handoff.sequence
  -> WiZ adapter
  -> per-bulb UDP setPilot
  -> optional gradual ramp scheduler
```

권장 Java/Spring API endpoint:

```text
GET  /api/lighting/wiz/discover
GET  /api/lighting/wiz/devices
POST /api/lighting/wiz/test-scene
POST /api/lighting/wiz/apply-plan
```

기본 안전 규칙:

- Discovery와 상태 읽기는 허용한다.
- 실제 `setPilot` 명령은 명시적인 사용자 action 뒤에서만 실행한다.
- 모든 전구에 broadcast하기 전에 단일 전구 또는 선택한 group부터 시작한다.
- brightness는 기존 NOOS 제한인 `10-88`로 clamp한다.
- CCT는 `2400-6500K`로 clamp한다.
- 빠른 flashing은 금지한다.

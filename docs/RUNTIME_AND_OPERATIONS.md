# Runtime And Operations

This project normally runs across the Mac local app and a Windows 4080 ACE-Step worker.

## Local Services

```text
Frontend Vite          http://localhost:3000
Backend Spring Boot    http://localhost:8080
ACE-Step worker        http://192.168.123.114:8011
WiZ bulbs              UDP 38899 on configured LAN IPs
```

The current backend defaults are in `backend/src/main/resources/application.properties`.

## Startup

Start frontend:

```bash
cd frontend
npm run start
```

Start backend:

```bash
cd backend
./gradlew bootRun
```

## Windows ACE-Step Worker

The Mac backend expects a remote ACE-Step API at:

```properties
noos.ai.ace-step.base-url=http://192.168.123.114:8011
```

The current target model configuration is:

```properties
noos.ai.ace-step.model=acestep-v15-xl-turbo
noos.ai.ace-step.lm-model=acestep-5Hz-lm-1.7B
noos.ai.ace-step.use-enhanced-request=false
noos.ai.ace-step.inference-steps=6
```

Windows handoff files created during setup live in `ai/docs/`.

## Health Checks

Frontend:

```bash
curl -I http://localhost:3000
```

Backend:

```bash
curl -sS -X POST http://localhost:8080/api/ai/intervention/prewarm \
  -H 'Content-Type: application/json' \
  -d '{}'
```

WiZ:

```bash
curl -sS http://localhost:8080/api/lighting/wiz/status
curl -sS http://localhost:8080/api/lighting/wiz/devices
```

ACE-Step worker directly:

```bash
curl -sS http://192.168.123.114:8011/health
```

## Lighting Model

The current lighting payload is `cct-plus-rgb`:

- Primary lighting uses WiZ `temp` CCT, based on research-backed `cct_kelvin`.
- Secondary lighting uses RGB planet accent color.
- Backend alternates primary/secondary every `noos.lighting.wiz.alternate-interval-sec` seconds.
- At session start, the backend snapshots each configured bulb's current WiZ `getPilot` state. `POST /api/lighting/wiz/stop` restores that snapshot, and the travel page calls it when the user leaves the generated music/light page.

Primary CCT and secondary RGB are generated in:

- `ai/noos_ai/intervention/lighting_research.py`
- `ai/noos_ai/intervention/lighting.py`
- `ai/noos_ai/intervention/lighting_hardware.py`

WiZ sends the final commands in:

- `backend/src/main/java/com/noos/backend/lighting/service/WizLightingService.java`

## Common Verification

Run all current checks:

```bash
cd ai
python3 -m unittest discover -s tests

cd ../backend
./gradlew test

cd ../frontend
npm run build
```

## Troubleshooting

If generation gets stuck around 95 percent:

- Check backend logs.
- Check ACE-Step worker health.

If WiZ bulbs do not sync:

- Check `/api/lighting/wiz/status`.
- Check `/api/lighting/wiz/devices`.
- Confirm all configured bulb IPs are reachable.
- A single bulb UDP read timeout should not stop write sync; writes are fire-and-forget with retry.

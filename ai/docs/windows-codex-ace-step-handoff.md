# Windows Codex Handoff: NOOS ACE-Step Worker on RTX 4080

이 문서는 Windows RTX 4080 PC에서 ACE-Step 1.5 API 서버를 실행해 Mac의 NOOS backend가 원격 음악 생성 worker로 사용할 수 있게 만드는 인수인계 메모다.

## 목표 구조

```text
Mac
- NOOS frontend
- Spring backend
- NOOS Python planner / recognition / intervention

Windows RTX 4080 PC
- ACE-Step API server only
- http://0.0.0.0:8011 로 열어 Mac backend가 접속
```

Mac backend는 나중에 다음처럼 Windows PC의 실제 LAN IP를 바라보게 설정한다.

```properties
noos.ai.ace-step.base-url=http://WINDOWS_PC_IP:8011
```

## Windows Codex가 해야 할 일

1. Windows PC에서 ACE-Step 1.5 repo 위치를 확인한다.

가능한 위치 예시:

```powershell
cd "C:\path\to\ACE-Step-1.5"
```

repo가 없으면:

```powershell
git clone https://github.com/ace-step/ACE-Step-1.5.git
cd ACE-Step-1.5
```

2. `uv`가 있는지 확인한다.

```powershell
uv --version
```

없으면 PowerShell에서 설치한다.

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

3. 의존성을 설치한다.

```powershell
uv sync
```

4. Windows 방화벽에서 8011 포트를 연다. 관리자 PowerShell이면:

```powershell
New-NetFirewallRule -DisplayName "ACE-Step API 8011" -Direction Inbound -Protocol TCP -LocalPort 8011 -Action Allow
```

5. ACE-Step API를 `0.0.0.0:8011`로 실행한다.

기본 추천은 DiT-only다. LM은 나중에 품질 모드로 따로 켠다.

```powershell
$env:ACESTEP_NO_INIT="true"
$env:ACESTEP_INIT_LLM="false"
$env:TOKENIZERS_PARALLELISM="false"
uv run acestep-api --host 0.0.0.0 --port 8011
```

주의:

```text
127.0.0.1 로 띄우면 Windows PC 자기 자신만 접속 가능하다.
Mac에서 붙으려면 반드시 0.0.0.0 으로 열어야 한다.
```

6. Windows PC의 LAN IP를 확인한다.

```powershell
ipconfig
```

`IPv4 Address` 값을 확인한다. 예:

```text
192.168.0.25
```

7. Windows PC 로컬에서 health 확인:

```powershell
curl http://127.0.0.1:8011/health
```

8. Mac에서 원격 health 확인:

```bash
curl http://WINDOWS_PC_IP:8011/health
```

정상 응답 예:

```json
{
  "data": {
    "status": "ok",
    "service": "ACE-Step API",
    "models_initialized": false
  },
  "code": 200
}
```

## 모델 정책

기본 음악 생성은:

```text
DiT: acestep-v15-turbo
LM: off
thinking: false
```

이유:

```text
Mac 실측에서 병목은 ACE-Step DiT diffusion이었다.
acestep-5Hz-lm-1.7B는 단독 음악 생성 모델이 아니라 보조 LM이다.
LM 1.7B는 정상 동작하지만 10초 생성 기준 더 느렸다.
따라서 기본값은 DiT-only가 맞고, LM은 품질/실험 모드로 분리하는 것이 좋다.
```

## Mac 쪽에서 나중에 필요한 코드 수정

Windows Codex가 당장 처리할 필요는 없지만, 전체 연동을 완성하려면 Mac repo에서 다음 수정이 필요하다.

1. `noos.ai.ace-step.base-url`을 Windows PC IP로 바꾸기

```properties
noos.ai.ace-step.base-url=http://WINDOWS_PC_IP:8011
```

2. ACE-Step auto-start를 local URL일 때만 실행하도록 분리

현재 Mac backend는 ACE-Step health 실패 시 로컬 `ai/scripts/start_acestep_api.sh`를 실행하려 한다. 원격 worker 구조에서는 Windows PC가 꺼져 있을 때 Mac에서 로컬 ACE-Step을 잘못 띄우면 안 된다.

권장 설정:

```properties
noos.ai.ace-step.auto-start=false
```

또는 URL이 `localhost`, `127.0.0.1`, `::1`일 때만 auto-start.

3. 원격 ACE-Step 오디오 결과 처리

현재 backend는 ACE-Step 결과의 `/v1/audio?path=...`에서 파일 경로를 뽑아 Mac 로컬 파일로 stream한다. Windows PC에서 생성하면 그 path는 Windows PC의 파일 경로이므로 Mac이 직접 읽을 수 없다.

권장 방식:

```text
Windows ACE-Step 생성 완료
-> Mac backend가 http://WINDOWS_PC_IP:8011/v1/audio?path=... 로 mp3 다운로드
-> Mac ai/generated/ace_step_audio/ 아래 저장
-> frontend에는 기존 /api/ai/audio?path=Mac-local-mp3-path 반환
```

즉 Windows PC는 음악 생성 공장, Mac은 앱 서버와 파일 보관소 역할을 한다.

## Windows Codex 검증 기준

Windows Codex는 다음을 확인하고 보고하면 된다.

```text
1. ACE-Step repo 경로
2. uv sync 성공 여부
3. RTX 4080 / CUDA 인식 여부
4. ACE-Step API가 0.0.0.0:8011에서 실행 중인지
5. Windows local health 응답
6. Windows LAN IP
7. Mac에서 curl http://WINDOWS_PC_IP:8011/health 로 접근 가능한지
```

가능하면 ACE-Step prewarm도 확인한다.

```powershell
curl -X POST http://127.0.0.1:8011/v1/init `
  -H "Content-Type: application/json" `
  -d "{\"model\":\"acestep-v15-turbo\",\"slot\":1,\"init_llm\":false}"
```

성공하면 `loaded_model`이 `acestep-v15-turbo`인지 확인한다.

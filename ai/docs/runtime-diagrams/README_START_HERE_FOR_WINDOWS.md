# 먼저 읽기: Windows RTX 4080 ACE-Step 작업자

이 ZIP은 Windows RTX 4080 PC에 전달하기 위한 NOOS / ACE-Step 인수인계 패키지다.

## Windows PC에서 목표

Windows PC는 앱 전체를 실행하지 않는다.

```text
Windows RTX 4080 PC
-> ACE-Step API 서버만 실행
-> http://0.0.0.0:8011
```

Mac은 나중에 이 주소로 붙는다.

```text
Mac 백엔드
-> http://WINDOWS_PC_IP:8011
```

## 읽는 순서

1. `windows-codex-ace-step-handoff.md`
2. `start_acestep_worker.ps1`
3. `verify_acestep_worker.ps1`
4. `MAC_REMOTE_BACKEND_NOTES.md`

## 가장 중요한 실행 명령

Windows PowerShell에서 ACE-Step 저장소 안으로 이동한 뒤:

```powershell
.\start_acestep_worker.ps1
```

또는 직접:

```powershell
$env:ACESTEP_NO_INIT="true"
$env:ACESTEP_INIT_LLM="false"
$env:TOKENIZERS_PARALLELISM="false"
uv run acestep-api --host 0.0.0.0 --port 8011
```

## 성공 기준

Windows PC에서:

```powershell
curl http://127.0.0.1:8011/health
```

Mac에서:

```bash
curl http://WINDOWS_PC_IP:8011/health
```

둘 다 JSON이 나오면 작업자 연결 준비가 된 것이다.

# Windows 4080 ACE-Step XL Turbo 테스트 요청

## 목적

Mac 백엔드는 현재 Windows 4080 PC의 ACE-Step API를 HTTP로 호출하고 있습니다.

현재 동작 중인 구성:

- Windows ACE API: `http://192.168.123.114:8011`
- 현재 DiT: `acestep-v15-turbo`
- 현재 LM: `acestep-5Hz-lm-1.7B`
- Mac 백엔드: 생성 완료 후 Windows mp3를 Mac `ai/generated/ace_step_audio/`로 다운로드해서 프록시함

이번 요청은 Windows 4080에서 `acestep-v15-xl-turbo`가 안정적으로 도는지 확인하는 것입니다.

## 판단 기준

RTX 4080 16GB 기준으로 `acestep-v15-xl-turbo`는 시도할 가치가 있습니다.

다만 16GB는 여유 구간이 아니라서 아래 조건으로 테스트해 주세요.

- DiT: `acestep-v15-xl-turbo`
- LM: `acestep-5Hz-lm-1.7B`
- `inference_steps`: `8`
- `batch_size`: `1`
- 테스트 길이: 10초 -> 30초 -> 60초 순서
- 16GB이므로 CPU offload는 켜는 쪽 권장
- `acestep-v15-xl-sft`는 이번 테스트 대상 아님. 50 step이라 훨씬 느리고 16GB에서는 부담 큼

## 권장 실행 방식

가능하면 기존 ACE API 프로세스를 중지하고, 깨끗하게 다시 시작해 주세요.

PowerShell 예시:

```powershell
cd "C:\Users\lucky\Downloads\NOOS ACE STEP\ACE-Step-1.5"

$env:ACESTEP_API_HOST = "0.0.0.0"
$env:ACESTEP_API_PORT = "8011"
$env:ACESTEP_CONFIG_PATH = "acestep-v15-xl-turbo"
$env:ACESTEP_LM_MODEL_PATH = "acestep-5Hz-lm-1.7B"
$env:ACESTEP_INIT_LLM = "true"
$env:ACESTEP_NO_INIT = "false"
$env:ACESTEP_DOWNLOAD_SOURCE = "huggingface"

# 4080 16GB 안정성 우선 설정
$env:ACESTEP_OFFLOAD_TO_CPU = "true"
$env:ACESTEP_OFFLOAD_DIT_TO_CPU = "false"
$env:ACESTEP_USE_FLASH_ATTENTION = "true"

uv run acestep-api --host 0.0.0.0 --port 8011 --download-source huggingface --init-llm --lm-model-path acestep-5Hz-lm-1.7B
```

만약 `uv run acestep-api`가 현재 환경에서 안 맞으면 기존에 쓰던 실행 방식으로 띄우되, 위 환경변수는 동일하게 적용해 주세요.

## 모델 다운로드

서버 시작 중 자동 다운로드가 되면 그대로 두면 됩니다.

수동 다운로드가 필요하면 아래 중 가능한 방식을 사용해 주세요.

```powershell
uv run acestep-download --model acestep-v15-xl-turbo
```

또는:

```powershell
huggingface-cli download ACE-Step/acestep-v15-xl-turbo --local-dir .\checkpoints\acestep-v15-xl-turbo
```

## 초기화 확인

Windows 로컬에서:

```powershell
curl http://127.0.0.1:8011/health
```

Mac에서 접근 가능해야 하는 주소:

```text
http://192.168.123.114:8011/health
```

기대값:

```json
{
  "data": {
    "models_initialized": true,
    "llm_initialized": true,
    "loaded_model": "acestep-v15-xl-turbo",
    "loaded_lm_model": "acestep-5Hz-lm-1.7B"
  }
}
```

만약 서버는 떴지만 모델이 아직 XL이 아니면 아래 요청으로 강제 초기화해 주세요.

```powershell
curl -X POST http://127.0.0.1:8011/v1/init `
  -H "Content-Type: application/json" `
  -d "{\"model\":\"acestep-v15-xl-turbo\",\"slot\":1,\"init_llm\":true,\"lm_model_path\":\"acestep-5Hz-lm-1.7B\"}"
```

## 짧은 생성 테스트

먼저 10초만 생성해 주세요.

```powershell
curl -X POST http://127.0.0.1:8011/release_task `
  -H "Content-Type: application/json" `
  -d "{\"model\":\"acestep-v15-xl-turbo\",\"prompt\":\"Instrumental only. Spacious polished ambient music, calm, cohesive, deep pads, subtle pulse, no vocals, no abrupt transitions.\",\"lyrics\":\"\",\"thinking\":true,\"lm_model_path\":\"acestep-5Hz-lm-1.7B\",\"audio_format\":\"mp3\",\"audio_duration\":10,\"task_type\":\"text2music\",\"inference_steps\":8,\"batch_size\":1,\"use_random_seed\":true,\"seed\":-1,\"negative_prompt\":\"vocal lead, spoken word, rap, crowd noise, harsh cymbal wash, EDM drop\"}"
```

응답에서 `task_id`를 받은 뒤:

```powershell
curl -X POST http://127.0.0.1:8011/query_result `
  -H "Content-Type: application/json" `
  -d "{\"task_id_list\":[\"여기에_task_id\"]}"
```

10초가 성공하면 같은 조건으로 30초, 60초까지 테스트해 주세요.

## 보내줘야 할 결과

Mac 쪽에 아래 내용을 알려주면 됩니다.

1. `/health` 응답 전체
2. `/v1/models` 응답 전체
3. `nvidia-smi` 스냅샷
4. 10초 생성 소요 시간
5. 30초 생성 소요 시간
6. 60초 생성 소요 시간
7. 성공한 mp3 파일 URL 또는 로컬 경로
8. OOM 또는 에러가 났다면 전체 에러 로그

## 성공하면 Mac 쪽에서 바꿀 설정

Windows에서 XL turbo가 성공하면 Mac 백엔드 설정을 아래처럼 바꾸면 됩니다.

```properties
noos.ai.ace-step.model=acestep-v15-xl-turbo
noos.ai.ace-step.use-enhanced-request=true
noos.ai.ace-step.lm-model=acestep-5Hz-lm-1.7B
noos.ai.ace-step.inference-steps=8
noos.ai.ace-step.request-duration-cap-sec=120
```

Mac 백엔드는 이미 원격 mp3 다운로드/프록시 구조가 구현되어 있으므로, Windows에서 `http://192.168.123.114:8011`로 XL turbo가 정상 응답하면 붙일 수 있습니다.


# ACE-Step NOOS Integration

이 문서는 NOOS가 ACE-Step 1.5를 어떻게 붙이는지 정리한다.

## 1. 현재 상태

NOOS 작업공간 안에 공식 저장소를 다음 경로로 내려받아 연동했다.

- [ai/vendor/ACE-Step-1.5](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/ai/vendor/ACE-Step-1.5)

이 디렉터리는 체크포인트와 런타임 크기가 커서 메인 앱 저장소에는 포함하지 않는다.  
필요하면 아래처럼 로컬에 직접 clone해서 같은 경로를 맞춘다.

```bash
cd "/Users/suhwan/Documents/NOOS AI MODULE/noosbeta260215/ai"
mkdir -p vendor
git clone https://github.com/ace-step/ACE-Step-1.5.git vendor/ACE-Step-1.5
```

또한 해당 저장소에서 `uv sync`를 실행해 로컬 런타임을 맞췄다.

## 2. 공식 근거

- GitHub: [ace-step/ACE-Step-1.5](https://github.com/ace-step/ACE-Step-1.5)
- Project Page: [ACE-Step 1.5](https://ace-step.github.io/ace-step-v1.5.github.io/)
- Paper: [arXiv 2602.00744](https://arxiv.org/abs/2602.00744)

확인한 사실:

- macOS Apple Silicon / MLX 지원
- REST API 지원
- `bpm`, `key_scale`, `time_signature`, `audio_duration` 제어 가능
- `thinking` 기반 LM planning 옵션 존재

## 3. 검증 상태

다음 방식으로 서버 최소 기동을 확인했다.

```bash
cd "/Users/suhwan/Documents/NOOS AI MODULE/noosbeta260215/ai/vendor/ACE-Step-1.5"
ACESTEP_NO_INIT=true uv run acestep-api --host 127.0.0.1 --port 8011
```

그리고 다음 health 응답을 확인했다.

```json
{
  "data": {
    "status": "ok",
    "service": "ACE-Step API",
    "version": "1.0",
    "models_initialized": false,
    "llm_initialized": false
  }
}
```

이 검증은 모델 로딩을 건너뛴 API 최소 기동 검증이다.  
즉, 서버/라우팅/헬스체크까지는 확인했고, 실제 음악 생성은 모델 초기화 후 별도 검증이 필요하다.

추가 검증 결과:

- `8012` 포트에서 실제 체크포인트 다운로드, 모델 초기화, 생성 성공까지 확인했다.
- `8013` 포트의 fresh server에서 `python3 -m noos_ai.cli <10초 intervention input> --generate-ace-step` 경로까지 성공 확인했다.
- 10초 `Neptune` intervention 기준으로 실제 mp3 파일 4개가 생성됐다.

즉 현재 기준 상태는 `minimum API verified`를 넘어서 `real generation verified`다.

## 4. NOOS가 직접 하는 일

ACE-Step는 상태를 이해하지 않는다.  
NOOS는 먼저 아래를 만든다.

- 현재 상태 벡터
- 목표 상태 벡터
- transition mode
- lighting spec
- music spec
- ACE prompt
- negative prompt

## 5. 권장 호출 방식

### 기본 요청

- `model`: `acestep-v15-turbo`
- `thinking`: `false`
- `task_type`: `text2music`
- `lyrics`: `""`
- `audio_format`: `mp3`

### 향상 요청

- `thinking`: `true`
- `lm_model_path`: `acestep-5Hz-lm-0.6B`

단, 향상 요청은 메모리와 초기화 시간이 더 든다.

## 6. 중요한 운영 원칙

- 보컬 없음
- 자유 생성보다 spec 기반 생성
- 단일 후보보다 복수 후보 생성 후 랭킹
- 갑작스러운 전환, 과도한 밝기, 강한 타격감은 억제

## 7. NOOS 래퍼

현재 NOOS에는 아래 래퍼가 구현돼 있다.

- [noos_ai/integrations/ace_step.py](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/ai/noos_ai/integrations/ace_step.py)

제공 기능:

- health check
- model listing
- model init
- task release
- result polling
- result JSON parsing
- local API start command 생성

또한 CLI에서 intervention 결과를 바로 생성 작업으로 넘길 수 있다.

```bash
cd "/Users/suhwan/Documents/NOOS AI MODULE/noosbeta260215/ai"
python3 -m noos_ai.cli examples/intervention_input.json --generate-ace-step --api-base-url http://127.0.0.1:8012
```

옵션:

- `--use-enhanced-request`: LM planning 포함
- `--output-json`: 결과 JSON 저장
- `--timeout-sec`: 생성 timeout 조절

## 8. 다음 검증 단계

실제 음악 생성 end-to-end 검증을 하려면 다음 순서가 필요하다.

1. `ACESTEP_NO_INIT` 없이 서버 기동
2. 기본 모델 초기화 완료 확인
3. NOOS intervention payload 1건 생성
4. `release_task` 호출
5. 결과 오디오 파일 생성 여부 확인

현재 문서/코드는 위 순서를 끝까지 수행할 수 있게 맞춰져 있다.  
다만 최초 1회는 공식 체크포인트 다운로드가 커서 시간이 많이 걸린다.

## 9. 운영 제약

- ACE-Step 단일 요청 최대 길이는 600초다.
- NOOS는 이 제한을 넘는 세션에 대해 `music_spec.render_plan.mode = segmented_render`를 만든다.
- 기본 batch 후보 수는 4개로 제한해 Apple Silicon 로컬 런타임에서 무리 없는 쪽으로 맞췄다.
- Apple Silicon MPS에서 여러 job을 연속 수행하면 메모리 압박으로 `text_encoder` 재적재 시 OOM이 날 수 있다.
- 실제 검증에서는 fresh server 재기동 후 동일 10초 요청이 정상 성공했다.
- 운영 권장:
  - 한 번에 한 job만 수행
  - 장시간 누적 사용 뒤 OOM이 보이면 API 서버 재기동
  - 기본값은 `default_request`와 `batch_size <= 4`

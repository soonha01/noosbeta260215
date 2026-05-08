# Mac Backend Remote ACE-Step Notes

Windows RTX 4080 PC에서 ACE-Step API가 켜지면, Mac backend는 `localhost:8011` 대신 Windows PC IP를 봐야 한다.

예:

```properties
noos.ai.ace-step.base-url=http://192.168.0.25:8011
```

## 주의 1: localhost 의미

```text
Mac에서 localhost = Mac 자기 자신
Windows에서 localhost = Windows 자기 자신
```

따라서 Mac backend가 Windows ACE-Step에 붙으려면 반드시 Windows PC의 LAN IP를 써야 한다.

## 주의 2: auto-start

현재 Mac backend는 ACE-Step이 안 닿으면 로컬 ACE-Step을 시작하려고 한다.

원격 worker 구조에서는 다음 정책이 필요하다.

```text
ACE-Step URL이 localhost면 auto-start 가능
ACE-Step URL이 원격 IP면 auto-start 금지, health check만 수행
```

권장 설정:

```properties
noos.ai.ace-step.auto-start=false
```

## 주의 3: 오디오 파일

Windows ACE-Step이 생성한 mp3 파일은 Windows PC 안에 있다.

Mac backend가 그 Windows 파일 경로를 직접 읽을 수 없으므로, 생성 완료 후 다음 처리가 필요하다.

```text
Mac backend
-> http://WINDOWS_PC_IP:8011/v1/audio?path=...
-> mp3 다운로드
-> Mac ai/generated/ace_step_audio/ 아래 저장
-> frontend에는 Mac backend /api/ai/audio?path=... 반환
```

이 방식이 지금 프로젝트 구조에 가장 잘 맞는다.


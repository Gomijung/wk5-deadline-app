# 틈 · 모바일 웹 PoC

이동 중에도 읽던 위치에서 활동을 이어가는 사용자 테스트용 프로토타입입니다. 저장 위치와 활동 기록은 브라우저의 `localStorage`에 남습니다.

## 실행

Python 3가 설치된 환경에서 프로젝트 폴더에서 다음 명령을 실행한 뒤 `http://localhost:4173`을 엽니다.

```sh
python3 server.py
```

외부 패키지 설치 없이 실행됩니다. 저장된 데모 상태를 초기화하려면 `http://localhost:4173/?reset=1`을 한 번 엽니다. 브라우저 개발자 도구에서 `teum-prototype-state` 항목을 삭제해도 됩니다.

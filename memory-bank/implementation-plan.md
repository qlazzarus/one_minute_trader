# 🧩 Implementation Plan — One Minute Trader

이 문서는 Codex CLI가 따라야 할 1주 완성형 MVP 개발 계획입니다.  
코드는 포함하지 않으며, 단계별 목표와 테스트 기준만 포함합니다.

---

## Step 1. Phaser 프로젝트 초기 세팅
**목표:**  
- Phaser 3 + Vite 개발환경 구성  
- Phaser 기본 Scene 구조(`BootScene`, `MenuScene`, `GameScene`, `ResultScene`) 생성  
- 브라우저에서 정상 실행 확인  

**산출물:**  
- `/phaser/package.json`, `/vite.config.js`, `/src/index.html`, `/src/main.js`  
- 기본 Scene 파일 4개  

**테스트:**  
- `npm run dev` 실행 시 “Hello Phaser” 텍스트가 화면에 표시되어야 함.  
- Scene 전환(`BootScene → MenuScene`)이 정상 동작해야 함.  

---

## Step 2. 기본 게임 로직 구현
**목표:**  
- 차트 애니메이션(가상 코인 시세 그래프) 추가  
- “Up” / “Down” 버튼 입력 및 결과 판정 로직 구현  
- 5초 단위 라운드 진행  
- 점수 및 콤보 계산 로직 추가  

**산출물:**  
- `/phaser/src/scenes/GameScene.js`  
- `/phaser/src/components/ScoreDisplay.js`, `/TimerDisplay.js`, `/CoinSelector.js`

**테스트:**  
- 버튼 클릭 시 5초 뒤 결과(성공/실패)가 표시되어야 함.  
- 연속 성공 시 점수 보너스(콤보)가 정상 적용되어야 함.  
- 콘솔 로그로 점수 누적 확인 가능해야 함.  

---

## Step 3. Flutter WebView 통합
**목표:**  
- Flutter 프로젝트 생성 및 `webview_flutter` 패키지 설치  
- Phaser 빌드 결과(`/phaser/build`)를 Flutter `assets/game/`으로 복사  
- WebView로 Phaser 게임 로드  

**산출물:**  
- `/flutter/lib/main.dart`, `/flutter/lib/screens/game_screen.dart`  
- `pubspec.yaml` 내 `assets/game/` 등록  

**테스트:**  
- `flutter run` 실행 시 WebView에서 Phaser 게임이 정상 표시되어야 함.  
- 모바일 기기 화면 비율에 맞게 렌더링되어야 함.  

---

## Step 4. JS ↔ Flutter 브릿지 연결
**목표:**  
- JS → Flutter: 점수 업데이트 이벤트 전달  
- Flutter → JS: 게임 재시작 명령 전달  
- `bridge_service.dart` 작성  

**산출물:**  
- `/flutter/lib/services/bridge_service.dart`  
- `/phaser/src/bridge.js`  

**테스트:**  
- JS에서 `window.flutter_inappwebview.callHandler('updateScore', 50)` 호출 시 Flutter에서 점수가 갱신되어야 함.  
- Flutter에서 “다시하기” 버튼을 누르면 Phaser의 `restartGame()` 실행되어야 함.  

---

## Step 5. 결과 요약 및 랭킹 화면 추가
**목표:**  
- Flutter 쪽에 결과 요약 및 점수 표시 화면(`ResultScreen`) 추가  
- 게임 종료 시 결과 전달 및 화면 전환  
- 점수 로컬 저장(`shared_preferences`)  

**산출물:**  
- `/flutter/lib/screens/result_screen.dart`  
- `/flutter/lib/widgets/score_card.dart`  

**테스트:**  
- 게임 종료 시 점수 요약 화면 표시  
- 재시작 버튼으로 게임 재진입 가능  
- 앱 재실행 후에도 마지막 점수 유지  

---

## ✅ 마무리
이 5단계 완료 시,
- Phaser 게임이 완전히 동작하고  
- Flutter 앱에서 임베드되어  
- 점수 통신 및 결과 표시까지 동작하는 MVP가 완성됩니다.  

다음 단계:  
- Codex CLI에서 `implementation-plan.md`를 로드한 후  
  첫 단계(`Step 1`)를 Ask 모드로 진행하세요.  
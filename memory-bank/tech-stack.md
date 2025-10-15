# ⚙️ Tech Stack — One Minute Trader

## 🎮 게임 엔진 (Game Layer)
**Phaser 3 (v3.80+)**
- 2D HTML5 게임 엔진.
- Canvas + WebGL 자동 전환으로 모바일에서도 빠름.
- Scene 구조로 화면 전환, 상태관리, 애니메이션 구현이 쉬움.
- 빠른 프로토타입 제작에 적합.

**개발 도구:**
- **Vite** (개발 서버 & 번들러)
  - `npm run dev` → 즉시 미리보기 가능.
  - `npm run build` → Flutter에 임베드할 정적 파일 출력.
- **Node.js v20+**
  - ES Modules 및 최신 JS 문법 사용.
  - Vite / npm 패키지 호환성 보장.

---

## 📱 앱 래퍼 (App Shell)
**Flutter (v3.24+)**
- iOS / Android 모두 지원.
- `webview_flutter`로 Phaser 빌드 결과를 로드.
- 향후 점수, 랭킹, 로그인 등 네이티브 기능 확장 용이.

**핵심 패키지:**
- `webview_flutter` – HTML5 게임 로드
- `provider` – 점수 상태관리
- `shared_preferences` – 로컬 점수 저장
- (선택) `in_app_review`, `share_plus` – 향후 SNS 공유 기능 확장용

---

## 🔄 통신 구조 (Bridge Layer)
**JS ↔ Flutter 통신**
- JS → Flutter: `window.flutter_inappwebview.callHandler('updateScore', score)`
- Flutter → JS: `controller.runJavascript('game.start()')`

**구현 파일:**
- `bridge_service.dart` (Flutter)
- `bridge.js` (Phaser)

**역할 분리:**
- Phaser: 게임 로직, 점수 계산, UI
- Flutter: 점수 표시, 화면 이동, 랭킹 저장

---

## 🗂️ 프로젝트 구조 요약

| Layer | 폴더 | 기술 | 역할 |
|-------|------|------|------|
| Game | `/phaser` | Phaser + JS | 실제 게임 로직 및 그래픽 |
| Wrapper | `/flutter` | Flutter + Dart | 앱 껍데기, WebView 및 네이티브 확장 |
| Memory | `/memory-bank` | Markdown | 설계 및 Codex용 문맥 관리 |
| Config | `/.codex` | JSON | Codex 규칙 및 작업 흐름 설정 |

---

## 🧰 개발 환경

| 구성 | 기술 |
|------|------|
| IDE | VSCode + Codex CLI (GPT-5 Codex) |
| 버전관리 | Git + GitHub |
| 테스트 | 수동 플레이테스트 (터미널 + 에뮬레이터) |
| 빌드 | Vite (Phaser) + Flutter CLI |
| 배포 | Flutter build → APK / IPA |
| 문서 자동화 | Codex CLI (`implementation-plan.md`, `progress.md`) |

---

## 🧠 AI & 자동화 도구

| 목적 | 도구 |
|------|------|
| 문서 관리 | Codex CLI (`codex init --load memory-bank/`) |
| 프롬프트 기반 개발 | Codex “Ask” / “Plan Mode” |
| 코드 리뷰 및 리팩토링 | Claude Code (보조 분석용) |

---

## 🎯 설계 원칙

1. **모듈 최소화:**  
   Flutter와 Phaser는 완전히 분리된 상태로, HTML 빌드 결과만 연결.
2. **간단한 브릿지 구조:**  
   점수만 주고받는 최소 인터페이스로 시작 → 나중에 확장.
3. **Vibe-coding 호환성:**  
   모든 코드는 Codex CLI를 통해 생성/갱신되며 `memory-bank` 기반으로 관리.
4. **테스트 우선:**  
   각 Scene 별로 독립 실행 가능하도록 구성 (`npm run dev`로 빠른 테스트)
5. **1주 내 MVP 완성:**  
   구현 계획(implementation-plan.md)은 5단계 이내로 나눈다.

---

## 💡 향후 확장 스택 제안 (선택적)

| 영역 | 추천 기술 | 목적 |
|------|-------------|------|
| 서버 연동 | Supabase / Firebase | 점수, 랭킹, 유저 관리 |
| 상태 저장 | Hive / SQLite (Flutter) | 오프라인 기록 저장 |
| 애널리틱스 | Firebase Analytics | 사용자 세션 추적 |
| 광고 | Google AdMob | 보상형 광고 수익화 |
| 배경 음악 | Howler.js | Phaser 사운드 관리 향상 |

---

## ✅ 버전 및 의존성 관리

| 항목 | 권장 버전 |
|------|-----------|
| Node.js | 20.x 이상 |
| Phaser | 3.80 이상 |
| Flutter SDK | 3.24 이상 |
| Dart | 3.5 이상 |
| Vite | 5.x 이상 |
| webview_flutter | 4.x 이상 |

---

## 📋 결론

> “가장 단순하면서도 견고한 구조”는 **Phaser + Flutter WebView + Codex CLI** 조합입니다.  
> 이 구조는 빠른 프로토타입 제작, AI 기반 반복 개발, 모바일 배포까지 모두 커버합니다.  
> 이후 Firebase 연동이나 뉴스 기반 난이도 조정 등으로 확장 가능합니다.
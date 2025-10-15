# 🧩 Game UI Architecture (v3.1 — One Minute Trader)

One Minute Trader는 Phaser 기반 2D UI를 Flutter WebView 내에서 렌더링한다.  
아래 문서는 씬 구조, 렌더링 계층, 데이터 전달 흐름을 정의한다.

---

## ⚙️ Scene Structure
| Scene | 역할 |
|--------|------|
| BootScene | Asset preload, texture filtering 설정 |
| MenuScene | 코인 선택, 초기화면, 버튼 인터랙션 |
| GameScene | 시세 그래프, HUD, BibiDisplay 표시, 콤보 처리 |
| ResultScene | 점수 요약 및 Flutter Bridge 호출 |

---

## 🧠 Rendering Hierarchy (Z-Depth)
| Layer | Element | z-index |
|--------|----------|---------|
| -0.2 | Chart backdrop (fade panel) | -0.2 |
| 0 | Chart card | 0 |
| 1 | Chart line / grid | 1 |
| 2 | HUDContainer (Score/Combo/Timer, Buttons) | 2 |
| 3 | BibiDisplay sprite (Bibi 캐릭터) | 3 |
| 4 | SpeechBubble (대사창) | 4 |
| ≥5 | Overlay / transition effects | 5+ |

> Depth는 Scene 간 공통 규칙으로 유지되어야 하며, Codex는 항상 이 순서에 맞춰 렌더링 순서를 보정해야 한다.

---

## 🧩 Layout Zones
| 영역 | 설명 |
|------|------|
| Top Zone | HUD (Score, Combo, Timer) 배치 — Orbitron 폰트, 네온 하이라이트 |
| Center Zone | Chart 표시 영역 (높이 60% 기준) |
| Bottom Zone | Button UI, BibiDisplay(좌측), SpeechBubble 포함 |
| Overlay Zone | Transition 효과 및 배경 글로우 표시 |

---

## 🧮 Scaling Rules
| 요소 | 스케일 계산식 |
|------|----------------|
| Bibi | `(scene.scale.height * 0.2) / sprite.height` |
| HUD Text | `(scene.scale.height * 0.035) / baseFontSize` |
| Chart | `scene.scale.width * 0.85`, height `scene.scale.height * 0.6` |
| Buttons | `scene.scale.width * 0.35`, height `scene.scale.height * 0.12` |

---

## 🧩 Component Communication
| From | To | 방식 | 설명 |
|------|----|------|------|
| GameScene | BibiDisplay | 메서드 호출 | speak(), setExpression() |
| BibiDisplay | AudioManager | sound.play(voiceKey) | 음성 재생 |
| GameScene | Flutter | window.flutter_inappwebview.callHandler | 점수 전송, 로그 이벤트 |
| HUD | GameScene | 이벤트 리스너 | 버튼 클릭, 타이머 종료 |
| Theme | 모든 컴포넌트 | `THEME` import | 색상/폰트/쉐도우 공유 |

---

## 🔁 Update Flow
1️⃣ BootScene → MenuScene → GameScene 순서로 전환  
2️⃣ GameScene에서  
   - HUD 생성  
   - Chart 초기화  
   - BibiDisplay attach  
   - Round Loop 시작  
3️⃣ Score/Combo 갱신 시 Bibi가 반응 (`bibi_happy` or `bibi_sad`)  
4️⃣ ResultScene으로 전환 후 점수 데이터를 Flutter에 전달  

---

## 🔒 Rendering Rules
- 모든 Scene은 `scene.cameras.main.ignore()` 호출 시 UIContainer 제외 금지  
- Codex는 Bibi나 HUD 관련 객체를 Container나 Camera에서 무시하지 않도록 해야 함  
- FPS 60 유지, 그래프와 HUD는 `Phaser.GameObjects.Graphics` 최소화로 성능 확보  
- UI 스타일은 반드시 `phaser/src/ui/theme.js`의 정의를 경유해 재사용한다.  

---

## 🔊 Asset Mapping
| Category | Folder | 예시 |
|-----------|---------|------|
| Sprite | `src/assets/sprites/` | `bibi_idle.png`, `bibi_happy.png` |
| Audio | `src/assets/audio/` | `bibi_coin_start.mp3`, `tap_click.wav` |
| Font | `src/assets/fonts/` | Orbitron, Press Start 2P |
| UI | `src/components/` | `BibiDisplay.js`, `ScoreDisplay.js`, `TimerDisplay.js` |

---

## 🧩 Codex Compliance Rule
> Codex는 항상 memory-bank의 UI 및 Architecture 기준을 따르며,  
> 새로운 씬이나 HUD 수정 시 이 문서를 자동으로 참조해야 한다.  
> 
> 특히 Bibi 관련 수정 시:
> - 위치: 좌측 하단 (HUD 아래, 버튼과 겹치지 않도록 margin 20px)  
> - 크기: 화면 높이의 약 20% 비율  
> - z-depth = 3  
> - ScaleMode = NEAREST / antialias=false  
> 를 반드시 유지해야 한다.

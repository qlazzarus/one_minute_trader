# 🎨 UI Design Guidelines (v3 — One Minute Trader)

이 문서는 One Minute Trader 게임의 전체 UI 일관성을 유지하기 위한 기준이다.  
Phaser 렌더링, Flutter WebView 통합, 그리고 Bibi 캐릭터 중심 인터랙션을 모두 고려한다.

---

## 🎮 Visual Style Overview
- 전반 톤: 다크 네이비 (#0d0d2b) + 네온 컬러 포인트
- 스타일 키워드: **Lo-Fi / Clean / Glow / Minimal HUD**
- 배경 대비: 최소 4.5:1 이상 확보
- 전반적 감정 톤: 캐주얼, 가벼움, 빠른 템포
- 색상/폰트/쉐도우 정의는 `phaser/src/ui/theme.js`를 단일 소스로 사용
- 폰트는 로컬 TTF(`assets/fonts/Orbitron-Bold.ttf`, `Orbitron-Regular.ttf`)에서 직접 로드하며, 전역 theme.js에서 관리한다.

---

## 🧍‍♀️ Bibi Sprite
| 속성 | 값 | 설명 |
|------|----|------|
| 위치 | 좌하단, 버튼 위 여백 20px | 버튼을 가리지 않음 |
| 기준점 | Anchor (0, 1) | 하단 기준 정렬 |
| 크기 | 화면 높이의 약 18~22% | 해상도 비례 자동 조정 |
| 스케일 모드 | Phaser.ScaleModes.NEAREST | 픽셀 선명도 유지 |
| 안티앨리어싱 | false | 캐릭터 라인 보존 |
| 깊이 | 3 | HUD 위, SpeechBubble 아래 |
| 글로우 | color: #00d5ff, alpha: 0.25, blur: 2px | 은은한 후광 효과 |
| 등장 애니메이션 | 알파 0 → 1 (400ms, Sine.easeInOut) | 부드러운 페이드 인 |
| 표정 키 | `bibi_idle`, `bibi_talk`, `bibi_happy`, `bibi_sad` | preload 에서 로드된 키 사용 |

---

## 💬 Speech Bubble
| 항목 | 값 |
|------|----|
| 위치 | Bibi 위쪽 + 오른쪽 오프셋 30px |
| 배경 | #0e1730 (opacity 0.8) |
| 테두리 | #33e8ff, 두께 2px |
| 크기 | width: 220~260px / height: 72px |
| 글자 | Orbitron 16px, color #ffffff |
| 패딩 | 12px |
| wordWrap | width 240 |
| 깊이 | 4 |
| 테일 삼각형 | 높이 18px, color 동일 |
| 애니메이션 | 대사 변경 시 scale 1.05 → 1.0 트윈 |

---

## 🧾 HUD (Score / Combo / Timer)
| 항목 | 값 |
|------|----|
| 위치 | 상단 중앙 (Score, Combo), 우측 상단 (Timer) |
| 배경 | 반투명 카드 (#00000060, radius 6px) |
| 폰트 | Orbitron Bold |
| 폰트 크기 | 16~20px |
| 색상 | 기본 #ffffff, Timer는 #33e8ff |
| 그림자 | 1px soft black (#000000, opacity 0.5) |
| 깊이 | 2 |
| 정렬 | 중앙 정렬, HUDContainer 그룹으로 묶음 |

---

## 📊 Chart (시세 그래프)
| 항목 | 값 |
|------|----|
| 배경 | 반투명 네이비 박스 (#00000040) |
| 선 색 | 상승 #00ff9d / 하락 #ff4d4d |
| 두께 | 2~3px (변동률 기반 가변) |
| 후광 | alpha 0.15, blur 2px |
| 에지 반사 | Additive BlendMode |
| 애니메이션 | 트윈 기반 점진적 업데이트 |
| 깊이 | 1 |
| 여백 | 상단 HUD와 12px 간격 유지 |

---

## 🕹️ Buttons (UP / DOWN)
| 항목 | 값 |
|------|----|
| 위치 | 화면 하단 중앙 |
| 크기 | 화면 너비의 35%, 높이 10~12% |
| 색상 | UP: #00ff9d / DOWN: #ff4d4d |
| Hover | 밝기 +20% |
| 글자 | Orbitron 18px, Bold |
| 그림자 | 없음 |
| 효과 | 클릭 시 scale 0.95 → 1.0 (100ms) |
| 효과음 | tap_click.wav (volume 0.5) |
| 깊이 | 2 |

---

## 📱 Responsive Design Rules
- 모든 요소의 크기는 `scene.scale.height` 기반 비례 계산.
- 세로형 기준(모바일 우선), 가로형에서는 Bibi와 HUD 위치 자동 재배치.
- 해상도별 기준 비율:
  - Bibi: 0.18~0.22 × height
  - HUD Text: 0.04 × height
  - Buttons: 0.12 × height
  - SpeechBubble: 0.09 × height
- aspect ratio가 16:9 미만이면 HUD를 압축 배치.

## 🧩 Layout Refinement (v4)
- Bibi 위치: 화면 우하단 (X = canvasWidth - 140, Y = canvasHeight - 100)
- SpeechBubble: Bibi 기준 왼쪽 위 (X - 180, Y - 90), 테일 오른쪽 아래로 향함
- ButtonGroup: Bibi 위쪽 Y - 60, 좌우 160px 간격
- Score: 상단 중앙, Time: Score 바로 아래 (offset +24px)
- 모든 텍스트는 Orbitron Regular, Timer는 Orbitron Bold + 하이라이트 컬러 (#33e8ff)

## 🧩 Layout Refinement (v5)
1. **HUD**
   - Score: 상단 중앙
   - Time: Score 아래 24px
   - Score/Time 둘 다 중앙 기준 정렬
   - HUDContainer vertical stack 적용

2. **Select Coin 영역**
   - Chart 위에서 16px 아래 위치
   - 폰트 Orbitron Bold, 크기 22px
   - Color: #ffffff, Shadow: #00000050

3. **ButtonGroup**
   - Bibi 위쪽 Y - 80
   - 좌우 버튼 간 간격 32px
   - ButtonGroup을 Bibi 중심 기준으로 수평 정렬
   - UP: X -90, DOWN: X +90

4. **Bibi & SpeechBubble**
   - Bibi: X = canvasWidth - 120, Y = canvasHeight - 100
   - scale: (height * 0.26) / sprite.height
   - SpeechBubble: X = Bibi.x - 180, Y = Bibi.y - 120
   - 테일 방향: 오른쪽 아래
   - SpeechBubble 크기: width 240, height 68
   - Font: Orbitron Regular 14px
   - Padding: 10px

5. **전체 비율 규칙**
   - 상단(HUD) ↔ 중단(Chart) ↔ 하단(ButtonGroup)의 간격을 화면 높이의 3%씩 동일하게 유지.
   - Chart 높이: height * 0.45
   - Bibi 영역 높이: height * 0.25

## 🧩 Layout Refinement (v6)

### 🧍‍♀️ Bibi & SpeechBubble
- Bibi: X = canvasWidth - 120, Y = canvasHeight - 60
- scale: (height * 0.26) / sprite.height
- Anchor: (0, 1)
- SpeechBubble:
  - X = Bibi.x - 210, Y = Bibi.y - 60
  - 삼각형 제거
  - width 240, height 68
  - 폰트 Orbitron Regular 14px
  - 패딩 10px
  - 배경 #0e1730 (opacity 0.8), border #33e8ff (2px)
  - 애니메이션 동일 (scale 1.05 → 1.0 트윈)
  - Bibi와 동일한 수평선상 유지

### 🎮 Buttons (UP / DOWN)
- ButtonGroup: Bibi 기준 위로 60px
- 간격 32px, 수평 중앙 정렬
- 버튼 높이 기존 대비 -10%
- 버튼과 Chart의 간격을 height * 0.03 이상 확보
- 그래프와 겹치면 Chart 높이를 자동 조정(height * 0.45 → height * 0.40)

### 🕹️ HUD (Score / Timer)
- Score: 상단 중앙 고정
- Timer: Score 아래로 24px 내려서 중앙 정렬
- Timer는 게임 시작 후(`isPlaying === true`)에만 표시
- 게임 전 상태에선 NaN 또는 0:00 대신 숨김 (`setVisible(false)`)

## 🧩 Interaction Flow (v7)

- Idle Phase:
  - 표시: BibiDisplay + SpeechBubble (“어떤 코인 할래?”)
  - 표시: CoinSelector (UP/DOWN 버튼 위쪽에 위치)
  - 숨김: Prediction Buttons (UP/DOWN)

- Gameplay Phase:
  - Coin 선택 후 CoinSelector 사라짐
  - Prediction Buttons 표시
  - Bibi의 말풍선은 라운드별 멘트로 전환
  - Timer 표시 시작
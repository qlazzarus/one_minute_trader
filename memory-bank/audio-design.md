# 🔊 Audio Design — One Minute Trader

## 톤 앤 무드
- 밝고 재치 있는 음성 톤
- 유저의 긴장을 풀어주는 캐릭터 음성
- 코믹 효과음 중심 (비트코인 트레이더 밈 느낌)

## 캐릭터 음성 예시
| 상황 | 대사 | 톤 |
|------|------|----|
| 시작 시 | “오늘은 BTC 간다~ 🚀” | 경쾌 |
| 실패 시 | “에이, 코인 다 팔걸...” | 장난스럽게 |
| 콤보 성공 | “이거 실력 아닌가요?” | 자신감 있게 |
| 타이머 종료 | “1분 끝! 수익률 계산 중~” | 해맑게 |

## 사운드 리소스
- 성공: `success_ding.wav`
- 실패: `fail_pop.wav`
- 버튼 클릭: `tap_click.wav`
- BGM: `lofi_coinbeat.mp3` (loop)

## 구현 메모
- Phaser의 `this.sound.play()`로 처리
- 음성은 mp3, 효과음은 wav
- 향후 ElevenLabs API로 캐릭터 보이스 자동 생성 고려

## Bibi Voice Categories
- start → bibi_start_1~3.mp3
- round_start → bibi_round_start_1~3.mp3
- round_warning → bibi_round_warning_1~3.mp3
- round_result_win → bibi_win_1~3.mp3
- round_result_lose → bibi_lose_1~3.mp3
- round_result_combo → bibi_combo_1~3.mp3
- round_last → bibi_last_1~3.mp3
- game_end → bibi_end_1~3.mp3
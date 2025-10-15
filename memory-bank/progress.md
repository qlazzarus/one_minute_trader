# 📈 Progress Log

- Step 2 (HUD & Audio Enhancements): `GameScene`에 Bibi 캐릭터 말풍선(`BibiDisplay`)과 상황별 음성 트리거를 연동하고, HUD 버튼/콤보 이벤트에 맞춰 `this.sound.play()`를 호출하도록 구현. `BootScene` 오디오 프리로드 및 `src/assets/audio/` 구조를 정리해 추후 Flutter 통합 시에도 일관된 자산 경로를 유지하도록 정비.
- Step 2 (Character Sprite Integration): `BootScene`에 Bibi 스프라이트 자산(`bibi_idle/talk/happy/sad`)을 프리로드하고, `BibiDisplay`가 대사 표현에 따라 텍스처를 전환하도록 리팩터링. `GameScene.sayBibi()`는 각 상황에 맞는 표정·음성을 동기화한다.
- Step 2 (Chart Visual FX): `GameScene.drawChart()`가 그라데이션/변동 폭 기반 선 굵기/라운드 인트로 트윈/콤보 발광(PostFX)과 함께 UI Design 대비 규칙에 맞춰 밝기 보정·글로우 레이어를 적용한다.
- WIP TODO: Flutter 브릿지(`bridge.js`, `bridge_service.dart`) 설계 초안 작성 및 점수/상태 업데이트 플로우 연결 테스트 준비.

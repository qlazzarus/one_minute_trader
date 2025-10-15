# Repository Guidelines

## Project Structure & Module Organization
- `phaser/` – Vite + Phaser game layer (scenes, UI components, bridge-ready JS). Entry points: `src/main.js`, HUD/character components in `src/components/`, shared styling in `src/ui/theme.js`.
- `flutter/` – Flutter shell embedding the Phaser build through WebView (native navigation, future bridge wiring).
- `memory-bank/` – Design documents (UI, architecture, implementation plans) that must be consulted before altering UX or game flow.
- `phaser/src/assets/` – Audio and sprite resources consumed by BootScene preload (`assets/audio/…`, `assets/sprites/bibi/…`).
- `test/` – Flutter-driven widget/unit tests (expand as integration grows).

## Build, Test, and Development Commands
- `npm install && npm run dev` (run in `phaser/`) – installs JS deps and launches the Vite dev server at `http://localhost:5173`.
- `npm run build` (in `phaser/`) – produces optimized assets in `phaser/dist/` for Flutter embedding.
- `flutter pub get && flutter run` (in repo root) – syncs Dart deps and runs the mobile shell with the latest Phaser build.
- `flutter test` – executes Flutter-side tests housed in `test/`.

## Coding Style & Naming Conventions
- JavaScript: ES modules, 2-space indentation, descriptive scene/component names (`GameScene.js`, `BibiDisplay.js`). Use the shared theme helpers in `src/ui/theme.js` for colors, fonts, and z-depths.
- Dart: Follow Flutter default formatting (`dart format .`). Widgets named in PascalCase.
- Assets: kebab-case for files (`bibi_idle.png`, `tap_click.wav`), grouped by type.

## Testing Guidelines
- Phaser logic is validated by manual playthrough; add Jest or Playwright suites under `phaser/tests/` when automation is introduced.
- Flutter uses `flutter test`; mirror filenames with `_test.dart` suffix.
- Aim for scenario coverage of scoring, combo progression, and JS↔Flutter bridge events as they come online.

## Commit & Pull Request Guidelines
- Commit messages use present-tense summaries (`feat: add combo glow to chart`, `fix: align bibi sprite scale`).
- Each PR should include: concise description, linked issue (if any), screenshots or GIFs for UI-affecting changes, and notes on testing performed (`npm run dev`, `flutter test`, etc.).
- Ensure UI changes stay consistent with `memory-bank/ui-design.md` and `memory-bank/architecture.md`; reference sections touched in the PR body.

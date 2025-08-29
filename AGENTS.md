# Repository Guidelines

## Project Structure & Module Organization
- `index.js`: CLI entry and orchestrator (ESM, Node 16+).
- `lib/`: Feature modules (battery, cpu, disk, host, memory, misc, network, pkg, shell, wm, color).
- `lib/win32` and `lib/darwin`: Platform-specific helpers.
- `.github/`: Repo assets (e.g., sample output image).

## Build, Test, and Development Commands
- `npm start`: Run locally via `node index.js`.
- `node index.js`: Execute without global install.
- `npm link` → `aoifetch`: Link locally and test the CLI as a global.
- Tip: Test across platforms (Linux, macOS, Windows/WSL, Termux) when changing system calls.

## Coding Style & Naming Conventions
- **Modules**: ESM (`type: module`), named exports from `lib/*.js`.
- **Indentation**: 2 spaces; keep semicolons; single quotes or backticks for strings.
- **Files**: lowercase names (e.g., `cpu.js`, `misc.js`); group platform code under `lib/win32` or `lib/darwin`.
- **Dependencies**: Keep minimal (currently only `chalk`). Prefer standard libs and shell tools.

## Testing Guidelines
- No formal test runner. Validate output manually:
  - `node index.js` and compare to README example.
  - Verify package counts, CPU, battery, and public IP on at least one target platform.
- Cross‑platform checks: 
  - Linux: `upower`, `/etc/os-release`.
  - macOS: `pmset`, Homebrew/MacPorts detection.
  - Windows/WSL: PowerShell CIM; legacy WMIC as fallback.
  - Termux: `termux-battery-status`; `PREFIX` used for detection.

## Commit & Pull Request Guidelines
- **Commits**: Imperative, present-tense, concise summary (e.g., “Improve CPU model detection”). Group related changes.
- **PRs**: Include description, rationale, platforms tested, before/after CLI screenshots when UI/output changes, and any follow-ups. Link issues.
- **Scope**: Keep changes focused; avoid introducing new deps unless essential.

## Security & Configuration Tips
- Use timeouts and safe parsing for shell calls; prefer read-only queries.
- Avoid blocking network calls; public IP should gracefully degrade.
- Never execute untrusted input; this tool reads system state only.

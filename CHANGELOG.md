# Changelog

## 0.3.0

### Added
- Windows Subsystem for Linux (WSL) detection.
- WMIC parsing helpers to robustly handle multi-property WMIC output for Windows and WSL support improvements.

### Changed
- Improved shell version display.
- Improved Windows battery display: now shows both percentage and status, instead of just percentage.

### Fixed
- Battery percentage for WSL users now works as expected.

## 0.2.0

### Major
- Modularized all logic: every info-gathering function moved to its own file in `lib/` (battery, cpu, disk, host, memory, misc, network, pkg, shell, wm, color)
- Centralized platform/Termux/Android detection in `misc.js:getPlatform()`, now explicitly distinguishes Termux
- `index.js` is now just a simple orchestrator with clean, alphabetically sorted imports – no system logic remains inline

### Enhanced Features
- Robust and explicit Termux/Android platform detection and output throughout
- Battery info: detects and displays percent in Termux using `termux-battery-status`; fallback/user guidance if missing perms/tool
- Host/device model now shows Android brand/model under Termux
- CPU: Improved detection/label for ARM/Android/Termux

### Other
- All WM, network/local IP, package, and locale logic moved to `lib/` modules
- GUNDALF.md updated for modular structure and new features
- All unused code/imports removed, APIs and main file simplified

## 0.1.0

### Initial release
- CLI-only Node.js tool, displays system info in format inspired by Neofetch
- Single-file implementation (index.js): gathers and prints username@hostname, OS, host/device, kernel, uptime, shell (+version), packages, Node version, CPU, memory, disk, IPs, battery, locale, and color bars
- Feature-complete for basic system info display on Linux, macOS, Windows
- Color output via `chalk` library
- No extra dependencies or config needed

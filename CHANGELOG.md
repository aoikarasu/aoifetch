# Changelog

## 0.4.0

### Added
- Cross-platform, modular package/app/module detection: supports dpkg, rpm, apk, pacman, Termux pkg, Homebrew, MacPorts, Chocolatey, Windows StartApps, and Node.js modules.
- Display of public IP address in standard output (uses curl/curl.exe, robust fallback).
- Improved pretty OS name/arch (Linux `/etc/os-release`, Windows CIM).
- CIM (PowerShell) querying and parsing helpers for robust property retrieval on Windows using modern API (replaces/augments legacy WMIC; future-proof for WSL/Windows platform info).

### Changed
- Improved CPU/ARM model and core count detection on all major platforms.
- Robust, platform-specific detection (Termux, Linux, macOS, Windows/WSL) and status/error messages.
- Mask bit/IPv4 computation and output are more robust; public IP logic added.
- Uptime, locale, and parsing improved; time units colorized; more helpers.
- Unified OS and architecture pretty-print (now modular, improved fallback).
- Now helper-driven, extensible, colorizes package counts, always lists node modules last.
- Codebase now modular, extensible, and easier to add platform quirks or features.

### Fixed
- Assorted bugfixes and logic improvements in package manager/platform detection, host/CPU/battery details, output formatting/consistency.

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

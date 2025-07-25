# Project Summary: aoifetch

## Overview

**aoifetch** is a simple system information tool inspired by Neofetch, implemented in Node.js. It displays key system details in the terminal, with colorful output using the `chalk` library.

## Project Structure

- `index.js`  — Main entry point. Gathers and displays system info.
- `lib/` — All functional logic modules, each focused on a specific type of system detail:
    - `battery.js` — battery info, status, and color logic, platform/WSL/Termux-aware
    - `color.js` — color utilities for output and bars
    - `cpu.js` — robust CPU/core detection; ARM/Android/Termux hardware handling
    - `disk.js` — disk usage gathering and format
    - `host.js` — host/model detection, enhanced per-OS (Linux, Termux, macOS, Windows)
    - `memory.js` — memory usage (used/total/percent)
    - `misc.js` — platform detection (including Termux, WSL), uptime formatting, locale detection, flexible output parsers
    - `network.js` — local IP/netmask (w/ correct bits), public IP, all interfaces
    - `pkg.js` — system and node package counting, modular detection for dpkg, rpm, pacman, apk, Termux-pkg, brew, port, choco, StartApps, .app, node
    - `shell.js` — shell path/version autodetection
    - `wm.js` — window manager/desktop parsing (per OS)
    - `win32/battery.js` — Win32 battery status mapping for Windows
    - `win32/wmic.js` — WMIC output parsing (legacy)
    - `win32/cim.js` — Windows CIM (PowerShell) querying helpers
    - `darwin/host.js` — Apple device model mapping
- `package.json` — Project manifest, main entry, bin setup, dependency management (chalk), repo/bugs/homepage fields.
- `README.md` — Usage and install guide, sample output.
- `.gitignore` — Standard ignores, all dot/backup/package-lock/node_modules.

## Modularization & Platform Updates
- Helper logic split into files for maintainability/extensibility.
- Platform detection in `lib/misc.js:getPlatform()`, WSL via `isWsl()`.
- OS, CPU, Battery, Network, and Package logic now robust/cross-platform and easy to extend via command/manager maps.
- Package counting is modular (see `lib/pkg.js`): managers/commands are mapped, not hardcoded; new package managers are a one-line addition.
- Improved `network.js`, `os.js`, and `battery.js` for cross-platform quirks.
- Colorized number outputs for increased clarity.

## Main Functional Features (index.js)
- Pure orchestrator; delegates all info gathering to modules.
- Unified output formatting uses chalk/color for emphasis, maskbits (IP), colored uptimes, colored package/battery counts.
- Displays:
    - User@Host
    - OS (pretty, arch, kernel)
    - Host/model
    - Uptime (colored)
    - Shell (+version)
    - WM/DE
    - Packages: e.g. `232 (dpkg), 31 (node)`
    - Node version
    - CPU (model, arch, core count, freq)
    - Memory (used/total, percent)
    - Disk root (used/total, percent)
    - All local IPv4s (w/ mask bits)
    - Public IP
    - Battery (percent, status, colored)
    - Locale
    - Color bars

## Design and Usage Notes
- Add logic by writing/extending modules in `lib/`.
- All platform quirks/edge-cases are abstracted in their own modules.
- Suitable for publish/distribution as a robust cross-platform CLI info script for Node.js.

---

This summary is maintained by gundalf-cli and should be updated as major changes are introduced.

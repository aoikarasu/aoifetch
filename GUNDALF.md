# Project Summary: aoifetch

## Overview

**aoifetch** is a simple system information tool inspired by Neofetch, implemented in Node.js. It displays key system details in the terminal, with colorful output using the `chalk` library.

## Project Structure

- `index.js`  — Main entry point. Gathers and displays system info.
- `lib/` — All functional logic modules, each focused on a specific type of system detail:
    - `battery.js` — battery information, percentage and color logic
    - `color.js` — color utilities for coloring output and printing color bars
    - `cpu.js` — CPU info detection and formatting
    - `disk.js` — disk usage gathering and formatting
    - `host.js` — host model detection, enhanced for Linux, Termux, macOS, Windows
    - `memory.js` — memory usage (used/total/percentage)
    - `misc.js` — miscellaneous utilities: platform detection (including Termux and WSL), uptime formatting, locale detection
    - `network.js` — local IP address discovery with mask bits, by interface
    - `pkg.js` — package/node_modules count
    - `shell.js` — shell path and version auto-detection
    - `wm.js` — window manager or desktop environment parsing for Linux/Windows
    - `win32/battery.js` — Win32 battery status code mapping for more accurate battery status display on Windows
    - `win32/wmic.js` — WMIC output parsing helpers for robust property extraction, with queryWslWmicProps for WSL-native WMIC access
- `package.json` — Project manifest. Lists dependencies (notably `chalk`), metadata, bin entry, and entry file (index.js). Now includes proper `repository`, `bugs`, and `homepage` fields for npm and GitHub integration.
- `README.md` — Usage and installation guide with badges and sample screenshot.
- `.gitignore` — Standard ignores, all dot-directories except `.github/`, node_modules/, backup files, and package-lock.json.

## Modularization & Platform Updates
- Helper functions are split into files in `lib/` for maintainability and composability.
- Platform detection logic centralized in `lib/misc.js` via `getPlatform()`.
- WSL detection via new `isWsl()` for robust support of WSL-specific logic (battery, future features).
- Windows and WSL WMIC helpers:
    - `queryWslWmicProps` enables WMIC-based detection in WSL (calls WMIC via `cmd.exe`).
    - Shared internal code for WMIC query construction minimizes duplication.
    - `getWmicProps` is unmodified, legacy-compatible for PATH-based queries.
- Battery info logic now supports WSL, including detection routines and accurate percent/status reporting for WSL-on-Windows laptops.

## Main Functional Features (index.js)
- Uses native Node.js modules `os` and `child_process`.
- Executable as a CLI tool (`#!/usr/bin/env node` shebang and bin setup).
- Output content and format is as previously described.
- Now orchestrates only, delegating all info gathering to `lib/` modules.

## Design and Usage Notes
- Designed for maintainability and extensibility: add a new function to `lib/` to extend.
- Project is publish-ready and suitable as a CLI system info tool for Node.js environments.

---

This summary is maintained by gundalf-cli and should be updated as major changes are introduced.

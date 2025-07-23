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
    - `misc.js` — miscellaneous utilities: platform detection (including Termux), uptime formatting, locale detection
    - `network.js` — local IP address discovery with mask bits, by interface
    - `pkg.js` — package/node_modules count
    - `shell.js` — shell path and version auto-detection
    - `wm.js` — window manager or desktop environment parsing for Linux/Windows
    - `win32/battery.js` — Win32 battery status code mapping for more accurate battery status display on Windows
    - `win32/wmic.js` — WMIC output parsing helpers for robust property extraction from Windows WMIC queries (added in 0.3.0)
- `package.json` — Project manifest. Lists dependencies (notably `chalk`), metadata, bin entry, and entry file (index.js). Now includes proper `repository`, `bugs`, and `homepage` fields for npm and GitHub integration.
- `README.md` — Usage and installation guide with badges and sample screenshot.
- `.gitignore` — Standard ignores, all dot-directories except `.github/`, node_modules/, backup files, and package-lock.json.

## Modularization Changes
- All helper functions are now split into files in `lib/`, instead of being defined inline in `index.js`. This includes battery, CPU, memory, disk, network, host detection, shell, WM, locale handling, and color utilities.
- Platform detection logic (including Termux) is centralized in `lib/misc.js` via getPlatform().
- Each functional area is exported as a named ES6 module.
- All imports in index.js now point to `./lib/`. Imports are sorted and unused imports have been removed.

## Main Functional Features (index.js)
- Uses native Node.js modules `os` and `child_process`.
- Executable as a CLI tool (`#!/usr/bin/env node` shebang and bin setup).
- Output content and format is as previously described.
- Now orchestrates only, delegating all info gathering to `lib/` modules.

## Design and Usage Notes
- Designed for maintainability and extensibility: add a new function to `lib/` to extend.
- Project is publish-ready and suitable as a CLI system info tool for Node.js environments.
- No output or logic changed; only internal code structure is modularized and improved.
- As of 0.3.0, robust Windows WMIC output helpers (`parseSpacePadded`, `parseCsv`, `getWmicProps`) allow for flexible and reliable parsing of multi-property WMIC outputs in Windows-specific modules.

---

This summary is maintained by gundalf-cli and should be updated as major changes are introduced.

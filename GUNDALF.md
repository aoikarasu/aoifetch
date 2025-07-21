# Project Summary: aoifetch

## Overview

**aoifetch** is a simple system information tool inspired by Neofetch, implemented in Node.js. It displays key system details in the terminal, with colorful output using the `chalk` library.

## Project Structure

- `index.js`  — Main entry point. Gathers and displays system info.
- `package.json` — Project manifest. Lists dependencies (notably `chalk`), metadata, bin entry, and entry file. Now includes proper `repository`, `bugs`, and `homepage` fields for npm and GitHub integration.
- `README.md` — Comprehensive usage and installation guide with badges and sample screenshot info, designed for npmjs.com and GitHub.
- `.gitignore` — Ignores `node_modules/`, backup files, **all dot-directories except `.github/`**, and `package-lock.json` from git.

## Main Functional Features (index.js)
- Uses native Node.js modules `os` and `child_process`.
- Executable as a CLI tool (`#!/usr/bin/env node` shebang and bin setup).
- Gathered information, in output order:
  - Username@hostname (with underline)
  - OS type, release, and platform
  - Host/Device model/platform (e.g. "Windows Subsystem For Linux - Debian", Raspberry Pi model, Android/Termux, Mac, etc)
  - Kernel version
  - Uptime (format: `40 days, 13 hours, 5 mins`, auto-pluralized)
  - Shell and shell version (e.g. `/bin/bash (GNU bash, version 5.1...)`)
  - Window Manager/Desktop (Linux: via `$XDG_CURRENT_DESKTOP`)
  - Package count (`node_modules` dirs counted)
  - Node.js version
  - CPU model (first core)
  - Memory (**used/total, with colored percentage**, e.g. `2.00 / 7.75 GB (25.8%)`—green/yellow/red)
  - Disk (/) usage (**used/total, with colored percentage**—green/yellow/red)
  - **Local IPv4 addresses:** All non-internal IPv4s, each labeled with adapter name and network prefix, as:
    - `Local IP (eth0): 192.168.8.178/24`
    - `Local IP (wlan0): ...`
  - **Battery percentage/charge** (**colored**: red/yellow/green according to charge percent; using system-specific commands; shows 'unknown' if unavailable)
  - **Locale with encoding** (like `en_US.UTF-8`) taken from environment or fallback
- Uses `chalk` for colored, stylized terminal output.
- **Displays color bars below main info, using ANSI color backgrounds, similar to neofetch.**
- Some platform distinctions (e.g., WM is only for Linux; fallback handling for Windows shell).

## Key Design Points
- Minimal structure; all logic is in `index.js`.
- Functional helper methods, no classes or config files.
- Designed for terminal/CLI usage (`node index.js` or `aoifetch` if installed globally or via npm link).
- Uses `bin` key in `package.json` for CLI invocation (as `aoifetch`).
- Script can be extended by adding new gather-* functions or new lines to output.
- Output is purely informational—no mutation of the system.
- **Project is publish-ready (npm). Package name is unscoped: `aoifetch`.**

## Dependency
- **chalk** (for color output)

## Extension & Modification Tips
- To add new system info, create a new function similar to `getUptime()` and add its result to the output block.
- Mind OS platform differences (use `process.platform` for checks).
- For new dependencies, add to `package.json` and run `npm install`.
- When updating metadata or publishing, keep `"repository"`, `"bugs"`, and `"homepage"` fields up to date for best npm/GitHub experience.
- Keep the command-line interface simple; currently there are no CLI flags or arguments.
- All output is synchronous; changes for async ops (filesystem, network) will require refactoring.
- See `.gitignore` for what is excluded from commits (**all dot-directories, except `.github/`**, backups, etc).
- Refer to `README.md` for user-facing usage and publishing details.

---

This summary is maintained by gundalf-cli and should be updated as major changes are introduced.

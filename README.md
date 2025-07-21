# aoifetch

[![npm version](https://badge.fury.io/js/aoifetch.svg)](https://npmjs.org/package/aoifetch)
[![GitHub stars](https://img.shields.io/github/stars/aoikarasu/aoifetch?style=social)](https://github.com/aoikarasu/aoifetch/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/aoikarasu/aoifetch)](https://github.com/aoikarasu/aoifetch/issues)
[![GitHub forks](https://img.shields.io/github/forks/aoikarasu/aoifetch?style=social)](https://github.com/aoikarasu/aoifetch/network/members)

A simple, colorful Neofetch-style CLI system information tool written in Node.js. Prints your system specs and hardware details in an eye-catching format, inspired by Neofetch but minimal and dependency-light.

---

## Features

- User@host and hostname info
- OS type, release, and platform
- Host/device model (supports Linux, Windows, macOS, Android/Termux)
- Kernel version
- Uptime (auto-pluralized)
- Shell and shell version
- Linux WM/Desktop environment (via `$XDG_CURRENT_DESKTOP`)
- Number of installed npm packages (`node_modules` count)
- Node.js version
- CPU model (first core)
- Memory usage (used/total, color-coded percent)
- Disk usage (/, root, color-coded percent)
- Local IPv4 addresses (all adapters)
- Battery percentage and charge status (colored)
- Locale with encoding (e.g. `en_US.UTF-8`)
- Two rows of ANSI color bars for extra style

## Installation

```
npm install -g aoifetch
```

## Usage

After installation, simply run:

```
aoifetch
```

Or, if not installed globally:

```
npx aoifetch
```

You’ll see a formatted output with your system stats and color bars.

![Sample aoifetch Output](https://raw.githubusercontent.com/aoikarasu/aoifetch/main/.github/aoifetch-sample.png)

## Example output

```
johndoe@myHost
----------------
OS:       Linux 6.2.0-26-generic (linux)
Host:     ThinkPad X1 Carbon 7th
Kernel:   6.2.0-26-generic
Uptime:   4 days, 13 hours, 18 mins
Shell:    /bin/bash (GNU bash, version 5.0.17)
WM:       GNOME
Packages: 152
NodeJS:   v18.17.1
CPU:      Intel(R) Core(TM) i7-8665U CPU @ 1.90GHz
Memory:   2.01 / 7.50 GB (26.8%)
Disk (/): 24.41 / 60.00 GB (40.7%)
Local IP (wlan0): 192.168.0.100/24
Battery:  84%
Locale:   en_US.UTF-8

<color bars>
```

## Requirements

- Node.js v16+ recommended
- For full functionality (e.g., battery status), works best on Linux/macOS/Windows with standard utilities installed.

## Platform Notes

- **Linux/WSL:** Detects distro/model, XDG desktop if available, battery via `upower`.
- **macOS:** Detects model, battery via `pmset`.
- **Windows:** Host via WMI, battery via WMIC.
- **Termux (Android):** Detected; some features may be limited.
- **All platforms:** Falls back gracefully if unsupported fields.

## FAQ

- **Why doesn’t battery info work?**  
  You may need `upower` (Linux) or a supported laptop battery.
- **How do I extend output?**  
  Edit `index.js` and add your desired data following the function style.

## License

MIT

---

> Made entirely with `gundalf-cli`.

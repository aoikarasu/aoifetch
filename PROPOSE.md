# Proposed Features

## Feature Ideas
- **ASCII Logo & Palette:** Auto distro/device ASCII logo with `--logo auto|file` and custom palettes `--palette=neofetch|classic|mono`. Support `~/.config/aoifetch/logo.txt`.
- **Layout Options:** `--compact`, `--no-bars`, `--width <cols>` to fit narrow terminals.

## System & Hardware
- **GPU Info:** Linux `lspci`/`glxinfo`, macOS `system_profiler`, Windows CIM `Win32_VideoController`.
- **Displays:** Resolution/refresh (Linux `xrandr`, macOS `system_profiler`, Windows WMI).
- **Thermals:** Temps/fans where available (Linux `sensors`; optional macOS `istats`; Windows ACPI).
- **Virtualization/Containers:** Detect WSL details, Docker/Podman, VMs (KVM/VMware/VirtualBox).

## Software & Environment
- **Desktop/Theme:** DE/WM theme, icon theme, terminal and font (Linux: env/XDG; macOS: Terminal/iTerm; Win: Terminal).
- **Shell & Prompt:** Current shell, version, and prompt framework (oh-my-zsh/starship) with `--shell-details`.
- **VCS Snapshot:** Optional current repo summary with `--git` (branch, dirty, ahead/behind).

## Output & UX
- **Formats:** `--json`, `--yaml`, `--plain` for scripting and logs.
- **Module Filter:** `--modules os,cpu,gpu,net` and `--no-network`/`--timeout 800ms` for fast runs.
- **Config File:** Read `~/.config/aoifetch/config.json` (modules, colors, palette, timeouts). `--config <path>`.
- **Snapshot:** `--save out.txt|out.json` to persist results.

## Extensibility
- **Plugin Hooks:** Load `~/.config/aoifetch/plugins/*.js` exporting `{name, collect()}`; print ordered by config.
- **Library API:** Export `collect()` returning structured data used by CLI; enables reuse/tests.
- **Templates:** Simple templating for lines, e.g. `--template ~/.config/aoifetch/template.txt`.

## Platform-Specific
- **Termux/Android:** Battery temp/health (`termux-battery-status`), device brand/model, storage stats; graceful fallbacks.
- **Linux:** Add Flatpak/Snap counts; distro ASCII from `/etc/os-release`.
- **macOS:** Model identifier, battery cycle count, Rosetta status.
- **Windows:** OEM model/BIOS, GPU VRAM, terminal app, better CIM fallbacks.

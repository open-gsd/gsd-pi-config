# Flatpak Build

This directory contains the Flatpak packaging for Pi.

## Files

- `com.opengsd.pi.yaml` - Flatpak manifest (uses GNOME 48 SDK for webkit2gtk-4.1)
- `com.opengsd.pi.desktop` - Desktop entry file
- `com.opengsd.pi.metainfo.xml` - AppStream metadata
- `com.opengsd.pi.svg` - Application icon
- `cargo-config.toml` - Cargo config for vendored dependencies
- `build.sh` - Vendor crates + build + install locally
- `create-bundle.sh` - Create bundle for distribution

## Why vendored crates?

The flatpak-builder sandbox isolates loopback networking, which breaks
DNS resolution when `/etc/resolv.conf` points to `127.0.0.53`
(systemd-resolved stub). Rather than modifying system DNS, we vendor
all Cargo crates on the host and build with `--offline`.

## Prerequisites

```bash
# Install flatpak and flatpak-builder
sudo apt install flatpak flatpak-builder

# Add Flathub
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo

# Install GNOME SDK (includes webkit2gtk-4.1)
flatpak install flathub org.gnome.Sdk//48 org.gnome.Platform//48
```

## Build & Install Locally

```bash
cd flatpak
./build.sh
```

## Run

```bash
flatpak run com.opengsd.pi
```

## Create Bundle for Distribution

```bash
./create-bundle.sh
```

## Notes

- Uses `org.gnome.Platform//48` runtime (includes webkit2gtk-4.1, GTK3, libsoup)
- Rust SDK extension is included via `append-path`
- Keyring access via `--filesystem=xdg-run/keyring`
- Network access enabled for updater functionality
- Binary is renamed from `gsd-pi-config` to `pi` in the Flatpak

## Flathub Submission

For Flathub submission, you'll need to:

1. Fork the flathub/com.opengsd.pi repository
2. Update the manifest to use git source instead of local dir
3. Add GPG signing
4. Submit PR to Flathub

See: https://docs.flathub.org/flatpak-prerequisites/

#!/bin/bash
# Build script for Flatpak
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Vendoring npm dependencies ==="
cd "$PROJECT_DIR"
rm -rf node_modules
npm ci 2>&1 | tail -5

echo ""
echo "=== Vendoring Cargo crates ==="
rm -rf flatpak/cargo-vendor
cargo vendor --versioned-dirs --manifest-path src-tauri/Cargo.toml flatpak/cargo-vendor 2>&1 | tail -3

echo ""
echo "=== Building Flatpak ==="
cd "$SCRIPT_DIR"
rm -rf .flatpak-builder build-dir
flatpak-builder --user --install --force-clean build-dir com.opengsd.pi.yaml

echo ""
echo "Done! Run with: flatpak run com.opengsd.pi"

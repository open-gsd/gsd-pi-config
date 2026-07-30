#!/bin/bash
# Create a release bundle for Flathub submission

set -e

cd "$(dirname "$0")"

# Build
flatpak-builder --repo=repo --force-clean build-dir com.opengsd.pi.yaml

# Create bundle
flatpak build-bundle repo com.opengsd.pi.flatpak com.opengsd.pi

echo "Bundle created: flatpak/com.opengsd.pi.flatpak"
echo "Upload to Flathub or host on your own repo."

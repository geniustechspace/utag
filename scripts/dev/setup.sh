#!/bin/bash
echo
echo "Checking for Node.js installation..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
else
    echo "Node.js is installed."
fi
echo

# Check if pnpm is installed, ask the user if they want to install it if not
./scripts/utils/install-pnpm.sh
echo

# Check if jq is installed, attempt to install with choco if available
./scripts/utils/install-jq.sh
echo

echo "Development environment setup is complete."

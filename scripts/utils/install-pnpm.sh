#!/bin/bash

echo "Checking for pnpm installation..."

# Check if pnpm is installed, ask the user if they want to install it if not
if ! command -v pnpm &> /dev/null; then
    echo "pnpm is not installed."
    echo
    read -p "Do you want to install pnpm? (y/n) " response
    if [[ "$response" == "y" || "$response" == "yes" || "$response" == "Y" || "$response" == "YES" ]]; then
        echo "Installing pnpm..."
        npm install -g pnpm
        echo
    else
        echo "Skipping pnpm installation. Please install it manually if needed."
        exit 1
    fi
else
    echo "pnpm is installed."
fi

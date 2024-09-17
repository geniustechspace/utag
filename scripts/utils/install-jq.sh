#!/bin/bash

echo "Checking for jq installation..."

# Check if jq is installed, attempt to install with choco if available
if ! command -v jq &> /dev/null; then
    echo "jq is not installed."
    echo
    if command -v choco &> /dev/null; then
        read -p "Do you want to install jq using Chocolatey? (y/n) " response
        if [[ "$response" == "y" || "$response" == "yes" || "$response" == "Y" || "$response" == "YES" ]]; then
            echo "Installing jq using Chocolatey..."
            choco install jq -y
        else
            echo
            echo "Skipping jq installation."
        fi
    else
        echo "Chocolatey is not installed, please install jq manually."
        exit 1
    fi
else
    echo "jq is installed."
fi

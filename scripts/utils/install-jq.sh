#!/bin/bash

echo "Checking for jq installation..."

# Check if jq is installed, attempt to install with choco if available
if ! command -v jq &> /dev/null; then
    echo "jq is not installed."
    echo

    # Check if an argument is provided for non-interactive mode
    if [[ "$1" == "--auto-confirm" || "$1" == "-y" || "$1" == "--yes" ]]; then
        response="yes"
    else
        # Prompt user for input in interactive mode
        if command -v choco &> /dev/null; then
            read -p "Do you want to install jq using Chocolatey? (y/n) " response
        else
            echo "Chocolatey is not installed, please install jq manually."
            exit 1
        fi
    fi

    # Proceed with installation if the response is yes
    if [[ "$response" == "y" || "$response" == "yes" || "$response" == "Y" || "$response" == "YES" ]]; then
        echo "Installing jq using Chocolatey..."
        choco install jq -y
    else
        echo
        echo "Skipping jq installation."
        exit 1
    fi
else
    echo "jq is installed."
fi

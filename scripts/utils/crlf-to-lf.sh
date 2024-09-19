#!/bin/bash

# Find and process files, excluding .git and node_modules directories
find . -type f -not -path './.git/*' -not -path './node_modules/*' -exec sh -c '
  for file; do
    sed -i "s/\r$//" "$file"
  done
' sh {} +

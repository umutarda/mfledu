#!/bin/bash
# setup_swap.sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Setting up 1GB swap file..."

# 1. Create a 1 Gigabyte file for swap
fallocate -l 1G /swapfile

# 2. Secure the swap file so only root can read it
chmod 600 /swapfile

# 3. Mark the file as a swap space
mkswap /swapfile

# 4. Turn the swap space on
swapon /swapfile

# 5. Make it permanent (so it survives server reboots)
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 6. Verify it worked
swapon --show

echo "Swap setup complete!"

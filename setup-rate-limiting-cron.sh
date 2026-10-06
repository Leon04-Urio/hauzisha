#!/bin/bash

# Rate Limiting Cron Job Setup Script
# This script sets up automatic cleanup for the rate limiting system

echo "Setting up Rate Limiting Cron Job..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLEANUP_SCRIPT="$SCRIPT_DIR/api/helpers/rate_limit_cleanup.php"

# Check if cleanup script exists
if [ ! -f "$CLEANUP_SCRIPT" ]; then
    echo "Error: Cleanup script not found at $CLEANUP_SCRIPT"
    exit 1
fi

# Make sure the script is executable
chmod +x "$CLEANUP_SCRIPT"

# Create the cron job entry
CRON_JOB="*/5 * * * * /usr/bin/php $CLEANUP_SCRIPT >> /var/log/rate_limit_cleanup.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "rate_limit_cleanup.php"; then
    echo "Cron job already exists. Updating..."
    # Remove existing job and add new one
    (crontab -l 2>/dev/null | grep -v "rate_limit_cleanup.php"; echo "$CRON_JOB") | crontab -
else
    echo "Adding new cron job..."
    # Add new job to existing crontab
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
fi

# Create log directory if it doesn't exist
sudo mkdir -p /var/log
sudo touch /var/log/rate_limit_cleanup.log
sudo chmod 666 /var/log/rate_limit_cleanup.log

echo "Cron job setup complete!"
echo "The cleanup script will run every 5 minutes."
echo "Log file: /var/log/rate_limit_cleanup.log"
echo ""
echo "To verify the cron job was added, run: crontab -l"
echo "To remove the cron job, run: crontab -e"
echo ""
echo "Manual cleanup can be run with:"
echo "php $CLEANUP_SCRIPT"
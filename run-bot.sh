#!/bin/bash

LOCK_FILE="/tmp/run-bot.lock"

if [ -f "$LOCK_FILE" ]; then
  echo "Cron job already running. Exiting..."
  exit 1
fi

# Create lock file
touch "$LOCK_FILE"

cd /Users/usmanirale/Code/nodejs/jobber
source .env
/opt/homebrew/bin/node dist/Cron.js


# Remove lock file after completion
rm -f "$LOCK_FILE"

#!/bin/bash

# Start Serena MCP Server for Link Manager project

export PATH="$HOME/.local/bin:$PATH"

cd /mnt/c/DDDDDD/LINK

# Activate Serena virtual environment
source serena/.venv/bin/activate

# Start Serena MCP server
echo "Starting Serena MCP server for Link Manager project..."
echo "Dashboard: http://127.0.0.1:24282/dashboard/index.html"
echo "Logs: /root/.serena/logs/"

python serena/scripts/mcp_server.py \
    --project /mnt/c/DDDDDD/LINK \
    --transport stdio \
    --log-level INFO \
    --context desktop-app \
    --mode interactive \
    --mode editing
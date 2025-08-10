#!/bin/bash

# Start Claude Code Usage Monitor

export PATH="$HOME/.local/bin:$PATH"

echo "Starting Claude Code Usage Monitor..."
echo "Available commands:"
echo "  claude-monitor         - Full name"
echo "  ccm                    - Short alias"
echo "  ccmonitor              - Alternative alias"
echo "  claude-code-monitor    - Descriptive alias"
echo "  cmonitor               - Short alias"
echo ""
echo "Example usage:"
echo "  claude-monitor --plan pro"
echo "  claude-monitor --view daily"
echo "  claude-monitor --help"
echo ""

# Start monitor with custom plan (auto-detected limits)
claude-monitor --plan custom --view realtime
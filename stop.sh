#!/bin/bash

echo "Killing all Python processes..."
pids=$(pgrep python)

if [ -z "$pids" ]; then
    echo "No Python processes found."
else
    kill $pids
    echo "Successfully killed Python processes with PIDs: $pids"
fi
#!/bin/bash

. env/bin/activate

sh ./stop.sh
trap 'sh ./stop.sh' INT

sleep 5

echo "Starting motors"
python3 motor.py &

# wait for all background jobs to complete
wait

echo "All programs have finished."
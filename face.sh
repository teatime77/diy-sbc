#!/bin/bash

./stop.sh
trap './stop.sh' INT

sleep 5

echo "Starting queue_manager"
python3 queue_manager.py &
sleep 5

echo "Starting server"
python3 server.py &
sleep 5

echo "Starting sensor"
python3 sensor.py &
sleep 5

echo "Starting face"
python3 face.py &

echo "3 programs have been started."
echo "Waiting for all background processes to finish..."

# wait for all background jobs to complete
wait

echo "All programs have finished."
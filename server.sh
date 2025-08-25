#!/bin/bash

. env/bin/activate

sh ./stop.sh
trap './stop.sh' INT

sleep 5

echo "Starting queue_manager"
python3 queue_manager.py &
sleep 5

echo "Starting server"
python3 server.py &

echo "Both programs have been started."
echo "Waiting for all background processes to finish..."

# wait for all background jobs to complete
wait

echo "All programs have finished."
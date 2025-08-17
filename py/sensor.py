import RPi.GPIO as GPIO
import time
from queue_manager import init_queue

queue = init_queue()

# GPIO Mode (BOARD / BCM)
GPIO.setmode(GPIO.BCM)

# Set GPIO Pins for Trigger and Echo
TRIG_PIN = 17  # Example, change to your chosen pin
ECHO_PIN = 18  # Example, change to your chosen pin

# Set up GPIO direction
GPIO.setup(TRIG_PIN, GPIO.OUT)
GPIO.setup(ECHO_PIN, GPIO.IN)

def get_distance():
    # Set TRIG to LOW
    GPIO.output(TRIG_PIN, False)
    time.sleep(0.05)  # Wait for sensor to settle

    # Set TRIG to HIGH
    GPIO.output(TRIG_PIN, True)
    # Give a short pulse (10uS)
    time.sleep(0.00001)
    # Set TRIG to LOW again
    GPIO.output(TRIG_PIN, False)

    # Wait for ECHO to go HIGH
    while GPIO.input(ECHO_PIN) == 0:
        pulse_start = time.time()
    
    # Wait for ECHO to go LOW
    while GPIO.input(ECHO_PIN) == 1:
        pulse_end = time.time()

    # Calculate pulse duration
    pulse_duration = pulse_end - pulse_start
    
    # Speed of sound is 34300 cm/s
    # Distance = time * speed / 2 (since it's a round trip)
    distance = pulse_duration * 17150

    distance = round(distance, 2)
    return distance

try:
    while True:
        distance = get_distance()
        print(f"Distance: {distance} cm")

        data_to_send = {
            "distance": distance
        }

        queue.put(data_to_send)

        time.sleep(1) # Wait 1 second before the next measurement

except KeyboardInterrupt:
    print("Measurement stopped by user")
    GPIO.cleanup()

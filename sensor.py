import RPi.GPIO as GPIO
import time
from queue_manager import init_queue

queue = init_queue()

# GPIO Mode (BOARD / BCM)
GPIO.setmode(GPIO.BCM)

# Set GPIO Pins for Trigger and Echo
TRIG_PIN = 14  # Example, change to your chosen pin
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
    hi = 0
    while GPIO.input(ECHO_PIN) == 0:
        pulse_start = time.time()
        hi += 1
        if 10000 < hi:
            return None
    
    # Wait for ECHO to go LOW
    lo = 0
    while GPIO.input(ECHO_PIN) == 1:
        pulse_end = time.time()
        lo += 1
        if 10000 < lo:
            return None

    # Calculate pulse duration
    pulse_duration = pulse_end - pulse_start
    
    # Speed of sound is 34300 cm/s
    # Distance = time * speed / 2 (since it's a round trip)
    distance = pulse_duration * 17150

    # print(F"hi:{hi} lo:{lo}")
    distance = round(distance, 2)
    return distance

try:
    idx = 0
    while True:
        distance = get_distance()
        print(f"Distance: {idx} {distance} cm")
        if distance is None:
            continue

        data_to_send = {
            "idx": idx,
            "distance": distance
        }

        queue.put(data_to_send)

        time.sleep(1) # Wait 1 second before the next measurement

        idx += 1

except KeyboardInterrupt:
    print("Measurement stopped by user")
    GPIO.cleanup()

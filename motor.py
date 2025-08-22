import board
import busio
from adafruit_servokit import ServoKit
import time

servo = None

class ServoController:
    def __init__(self):

        # Initialize the I2C bus
        # For Raspberry Pi 3B+, the default I2C pins are GPIO2 (SDA) and GPIO3 (SCL)
        self.i2c = busio.I2C(board.SCL, board.SDA)

        # Initialize the PCA9685. The default I2C address is 0x40.
        # If you have multiple PCA9685 boards with different addresses, specify it here.
        # For 16 channels, use ServoKit(channels=16)
        self.kit = ServoKit(i2c=self.i2c, channels=16) 

        # Set the PWM frequency (50 Hz is standard for most hobby servos)
        # This is usually set by default in ServoKit, but you can explicitly set it if needed.
        self.kit.frequency = 60 

        # Define the servo channel you're using (e.g., channel 0)


    def play(self):
        servo_channel = 0
        print(f"Controlling servo on channel {servo_channel}")
        print("Moving servo from 0 to 180 degrees and back...")

        try:
            while True:
                # Move servo to 0 degrees
                self.kit.servo[servo_channel].angle = 0
                self.kit.servo[servo_channel+1].angle = 0
                self.kit.servo[servo_channel+2].angle = 0
                print("Angle: 0 degrees")
                time.sleep(1)

                # Move servo to 90 degrees
                self.kit.servo[servo_channel].angle = 90
                self.kit.servo[servo_channel+1].angle = 90
                self.kit.servo[servo_channel+2].angle = 90
                print("Angle: 90 degrees")
                time.sleep(1)

                # Move servo to 180 degrees
                self.kit.servo[servo_channel].angle = 180
                self.kit.servo[servo_channel+1].angle = 180
                self.kit.servo[servo_channel+2].angle = 180
                print("Angle: 180 degrees")
                time.sleep(1)

        except KeyboardInterrupt:
            print("\nExiting program.")
            # Optional: Set the servo to a neutral position before exiting
            self.kit.servo[servo_channel].angle = 90
            self.kit.servo[servo_channel+1].angle = 90
            self.kit.servo[servo_channel+2].angle = 90
            time.sleep(0.5)

    def move(self, channel, angle):
        self.kit.servo[channel].angle = angle
        print(f"servo channel:{channel} angle:{angle}")

def initServo():
    global servo
    servo = ServoController()
    print("servo init")

def moveServo(channel, angle):
    if servo is None:
        initServo()
        
    servo.move(channel, angle)

if __name__ == '__main__':
    initServo()
    servo.play()
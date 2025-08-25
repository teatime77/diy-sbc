#!/bin/bash

echo "update package index files"
sudo apt update

echo "upgrade packages"
sudo apt upgrade -y

echo "enable ssh server"
sudo raspi-config nonint do_ssh 0

echo "enable I2C"
sudo raspi-config nonint do_i2c 0

echo "install camera and opencv"
sudo apt install -y python3-picamera2 python3-opencv

echo "make a virtual environment of python."
echo "To avoid mismatches between picamera2 and opencv versions, use the global Python packages with --system-site-packages."
python3 -m venv ./env --system-site-packages

echo "enter the virtual environment"
. ./env/bin/activate

echo "install I2C and servo motor libraries"
pip3 install adafruit-blinka adafruit-circuitpython-pca9685 adafruit-circuitpython-servokit RPi.GPIO

echo "install Flask web server"
pip3 install Flask

echo "install Joystick libraries"
pip3 install pygame

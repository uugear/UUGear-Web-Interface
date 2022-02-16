# UUGear-Web-Interface
UUGear Web Interface (UWI) is an very lightweight web server that allows you to access your Raspberry Pi and UUGear devices in web browser. It only uses very limited system resource (about 2~6% CPU usage) and even Raspberry Pi Zero (W) can run it very well.

## Supported Devices
Currently UUGear Web Interface supports these devices:
- Raspberry Pi (GPIO): view and control the GPIO pins on your Raspberry Pi.
- Witty Pi 3: monitor and manage your Witty Pi 3 or Witty Pi 3 Mini.
- Zero2Go Omini: monitor and manage your Zero2Go Omini.
- MEGA4: 4-PORT USB 3.1 PPPS HUB FOR RASPBERRY PI 4B.
- PiGear Nano: Nano–ITX carrier board for Raspberry Pi Compute Module 4. 

## How to install
You can install UWI with this single command line:
> curl https://www.uugear.com/repo/UWI/installUWI.sh | sudo bash

Alternatively, you can download the install script and run it.
> wget https://www.uugear.com/repo/UWI/installUWI.sh

> sudo sh installUWI.sh

If you install software for Witty Pi 3 (Mini) or Zero2Go Omini, their install script will also install UWI for you.

After installation, you will need to reboot your Raspberry Pi, and then you can access your devices via http://raspberrypi:8000/

# UUGear-Web-Interface
UUGear Web Interface (UWI) is an very lightweight web server that allows you to access your Raspberry Pi and UUGear devices in web browser. It only uses very limited system resource (about 2~6% CPU usage) and even Raspberry Pi Zero (W) can run it very well.

## Supported Devices
Currently UUGear Web Interface supports these devices:
- Raspberry Pi (GPIO): dummy device for viewing and controling the GPIO pins on your Raspberry Pi.
- Witty Pi 3 (Full-sized or Mini): realtime clock and power management for Raspberry Pi.
- Zero2Go Omini: wide input range, multi-channel power supply for Raspberry Pi.
- MEGA4: 4-Port USB 3.1 PPPS Hub for Raspberry Pi 4B.
- PiGear Nano: Nano–ITX carrier board for Raspberry Pi Compute Module 4. 

## How to install
You can install UWI with this single command line:
> curl https://www.uugear.com/repo/UWI/installUWI.sh | sudo bash

Alternatively, you can download the install script and run it.
> wget https://www.uugear.com/repo/UWI/installUWI.sh

> sudo sh installUWI.sh

If you install software for Witty Pi 3 (Mini), Zero2Go Omini or PiGear Nano, their install script will also install UWI for you.

After installation, you will need to reboot your Raspberry Pi, and then you can access your devices via http://raspberrypi:8000/

Remarks: if your Raspberry Pi is not using the "raspberrypi" host name, or this hostname is not resolvable in your network enviroment, you need to edit the "uwi.conf" file and replace "reaspberrypi" with the actual host name or IP address of your Raspberry Pi.

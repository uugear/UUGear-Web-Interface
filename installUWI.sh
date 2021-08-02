[ -z $BASH ] && { exec bash "$0" "$@" || exit; }
#!/bin/bash
# file: installUWI.sh
#
# This script will install UUGear Web Interface (UWI).
# It is recommended to run it in your home directory.
#

# check if sudo is used
if [ "$(id -u)" != 0 ]; then
  echo 'Sorry, you need to run this script with sudo'
  exit 1
fi

# target directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/uwi"

# error counter
ERR=0

echo '================================================================================'
echo '|                                                                              |'
echo '|          UUGear Web Interface (UWI) Installation Script                      |'
echo '|                                                                              |'
echo '================================================================================'

# enable I2C on Raspberry Pi
echo '>>> Enable I2C'
if grep -q 'i2c-bcm2708' /etc/modules; then
  echo 'Seems i2c-bcm2708 module already exists, skip this step.'
else
  echo 'i2c-bcm2708' >> /etc/modules
fi
if grep -q 'i2c-dev' /etc/modules; then
  echo 'Seems i2c-dev module already exists, skip this step.'
else
  echo 'i2c-dev' >> /etc/modules
fi

i2c1=$(grep 'dtparam=i2c1=on' /boot/config.txt)
i2c1=$(echo -e "$i2c1" | sed -e 's/^[[:space:]]*//')
if [[ -z "$i2c1" || "$i2c1" == "#"* ]]; then
  echo 'dtparam=i2c1=on' >> /boot/config.txt
else
  echo 'Seems i2c1 parameter already set, skip this step.'
fi

i2c_arm=$(grep 'dtparam=i2c_arm=on' /boot/config.txt)
i2c_arm=$(echo -e "$i2c_arm" | sed -e 's/^[[:space:]]*//')
if [[ -z "$i2c_arm" || "$i2c_arm" == "#"* ]]; then
  echo 'dtparam=i2c_arm=on' >> /boot/config.txt
else
  echo 'Seems i2c_arm parameter already set, skip this step.'
fi

# install i2c-tools
echo '>>> Install i2c-tools'
if hash i2cget 2>/dev/null; then
  echo 'Seems i2c-tools is installed already, skip this step.'
else
  apt-get install -y i2c-tools || ((ERR++))
fi

# check if it is Raspberry Pi 4
isRpi4=$(cat /proc/device-tree/model | sed -n 's/.*\(Raspberry Pi 4\).*/1/p')

# install wiringPi
if [ $ERR -eq 0 ]; then
  echo '>>> Install wiringPi'
  ver=0;
  if hash gpio 2>/dev/null; then
  	ver=$(gpio -v | sed -n '1 s/.*\([0-9]\+\.[0-9]\+\).*/\1/p')
  	echo "wiringPi version: $ver"
 	else
 		apt-get -y install wiringpi
 		ver=$(gpio -v | sed -n '1 s/.*\([0-9]\+\.[0-9]\+\).*/\1/p')
  fi
	if [[ $isRpi4 -eq 1 ]] && (( $(awk "BEGIN {print ($ver < 2.52)}") )); then
 		wget https://project-downloads.drogon.net/wiringpi-latest.deb || ((ERR++))
		dpkg -i wiringpi-latest.deb || ((ERR++))
		rm wiringpi-latest.deb
  fi
fi

# install UUGear Web Interface (UWI)
if [ $ERR -eq 0 ]; then
  echo '>>> Install/update UWI'
  wget https://www.uugear.com/repo/UWI/LATEST -O uwi.zip || ((ERR++))
  unzip uwi.zip -d uwi.latest || ((ERR++))
  cd uwi.latest
  chmod +x messanger.sh
  chmod +x websocketd
  sed -e "s#/home/pi/uwi#$DIR#g" uwi >/etc/init.d/uwi
  chmod +x /etc/init.d/uwi
  update-rc.d uwi defaults || ((ERR++))
  touch uwi.log
  cd ..
  chown -R $SUDO_USER:$(id -g -n $SUDO_USER) uwi.latest || ((ERR++))
  sleep 2
  rm uwi.zip
  
  if [ -d "uwi" ]; then
    cur_ver=$(cat uwi/common/js/common.js | grep 'var version =' | sed "s/var version = '//" | sed "s/';//")
    latest_ver=$(cat uwi.latest/common/js/common.js | grep 'var version =' | sed "s/var version = '//" | sed "s/';//")
    echo ''
    echo "Current UWI version=${cur_ver}, latest UWI version=${latest_ver}"
    if (( $(echo "$latest_ver $cur_ver" | awk '{print ($1 > $2)}') )); then
      echo "UUGear Web Interface (UWI) was installed but there is a newer version now."
      postfix=$(tr -dc A-Z0-9 </dev/urandom | head -c 3)
      echo "The current version will be moved to 'uwi_${postfix}'. [Please delete it after review]"
      echo "The latest version will be installed to 'uwi' directory."
      mv uwi "uwi_${postfix}"
      mv uwi.latest uwi
    else
      echo "UUGear Web Interface (UWI) is installed and there is no newer version now."
      rm -R uwi.latest
    fi
  else
    mv uwi.latest uwi
  fi
fi

echo
if [ $ERR -eq 0 ]; then
  echo '>>> All done. Please reboot your Pi to have UWI server running :-)'
  echo 'With default settings, the web interface URL is http://raspberrypi:8000/'
else
  echo '>>> Something went wrong. Please check the messages above :-('
fi

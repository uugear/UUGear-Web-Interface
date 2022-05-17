#!/bin/bash
#
# file: diagnose.sh
#
# usage: ./diagnose.sh
#
# Run this script if you have problem accessing UWI from another device.
# It will try to find the local IP address and configure it to uwi.conf.
# It will also restart the local UWI server, so the change can take effect.
#

my_dir="`dirname \"$0\"`"
my_dir="`( cd \"$my_dir\" && pwd )`"
. "$my_dir/uwi.conf"

configUWI()
{
  ip=$1
  echo "Configure host to $ip in uwi.conf..."
  sed -i "s_\(host=\)\(.*\)_\1'$ip';_" "$my_dir/uwi.conf"
  echo 'Restarting UWI server...'
  pid=$(cat /var/run/uwi.pid)
  sudo kill -9 $pid > /dev/null 2>&1
  sudo "$my_dir/uwi.sh" >> "$my_dir/uwi.log" &
  while [ "$(cat /var/run/uwi.pid)" == "$pid" ]; do
    sleep 1
  done
  echo 'UWI server has been restarted.'
  echo "You can now access UWI via http://$ip:$port"
}

ips=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1')

IFS=$'\n' read -rd '' -a ips <<<"$ips"

count=${#ips[@]}
if [ $count -eq 0 ]; then
  echo 'Can not find any usable IP address'
elif [ $count -eq 1 ]; then
  echo "Only found one IP address: ${ips[0]}"
  configUWI ${ips[0]}
else
  echo "I found $count IP addresses:"
  for (( i=0; i<$count; i++ ));
  do
    echo "  [$(($i+1))] ${ips[$i]}"
  done
  sel=0
  while ! [[ "$sel" =~ ^[0-9]+$ ]] || [ $sel -lt 1 ] || [ $sel -gt $count ]; do
    read -p "Which one should I use? (1~$count) " sel
    if ! [[ "$sel" =~ ^[0-9]+$ ]] || [ $sel -lt 1 ] || [ $sel -gt $count ]; then
      echo "  Please input number 1~$count"
    fi
  done
  configUWI ${ips[$(($sel-1))]}
fi

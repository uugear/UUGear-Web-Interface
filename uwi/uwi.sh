#!/bin/bash
#
# file: uwi.sh
#
# This script will run automatically after boot
#

uwi_dir="`dirname \"$0\"`"
uwi_dir="`( cd \"$uwi_dir\" && pwd )`"
if [ -z "$uwi_dir" ] ; then
  exit 1
fi


while [[ -z "$uwiPid" ]]; do
  . "$uwi_dir/uwi.conf"
  echo "Running command: $uwi_dir/websocketd --address=$host --port=$port --staticdir=$uwi_dir $uwi_dir/messanger.sh"
  "$uwi_dir/websocketd" --address=$host --port=$port --staticdir="$uwi_dir" "$uwi_dir/messanger.sh" &
  uwiPid=$!
  echo $uwiPid > /var/run/uwi.pid
  sleep 5
  if [[ -z "$(ps -p $uwiPid -o pid=)" ]]; then
    uwiPid=''
    echo 'UWI server started failed, try again...'
  fi
done

echo "UWI server is started with pid=$uwiPid"



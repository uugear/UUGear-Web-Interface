#!/bin/bash

my_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
. "$my_dir/../uwi.conf"
. "$my_dir/../common/common.sh"
. "$mega4/utilities.sh"

api_has_hardware()
{
  result=$(lsusb | grep "ID 2109:2817 VIA Labs, Inc.")
  if [[ ${#result} -gt 0 ]]; then
		echo "yes"
	else
		echo "no"
	fi
}

api_has_software()
{
  if [[ -d "$mega4" ]]; then
    echo "yes"
  else
    echo "no"
  fi
}

api_get_devices_info()
{
  get_devices_info
}

api_turn_on_ports()
{
  turn_on_ports $1 $2
}

api_turn_off_ports()
{
  turn_off_ports $1 $2
}

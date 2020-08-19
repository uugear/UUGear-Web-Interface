#!/bin/bash

api_get_rpi_model()
{
	cat /proc/device-tree/model
}

api_get_wiringpi_version()
{
  if hash gpio 2>/dev/null; then
    echo $(gpio -v | sed -n '1 s/.*\([0-9]\+\.[0-9]\+\).*/\1/p')
  else
    echo '0.00'
  fi
}

api_readall()
{
	result=$(gpio readall)
	if (( ${#result} > 1920 )); then
		local output=''
		local offset=265
		for ((pin=1; pin<=40; pin+=2,offset+=80)); do
			mode=${result:$offset:4}
			value=${result:$((offset+7)):1}
			if [ -z "$output" ]; then
				output="$mode,$value"
			else
				output="$output+$mode,$value"
			fi
			value=${result:$((offset+22)):1}
			mode=${result:$((offset+26)):4}
			output="$output+$mode,$value"
		done
		echo $output
	else
		echo "Error: $result"
	fi
}

api_write_pin()
{
	# $1 is the physical pin number, $2 is the new value
	gpio -1 write $1 $2
	gpio -1 read $1
}

api_set_mode()
{
	# $1 is the physical pin number, $2 is the new mode
	gpio -1 mode $1 $2
}
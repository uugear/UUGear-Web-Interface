#!/bin/bash

# write log to uwi.log only when debug>0
log()
{
	if (( $debug > 0 )); then
		local t=$(date '+%Y-%m-%d %H:%M:%S.%3N')
		log_dir=$(dirname "${BASH_SOURCE[0]}");
		echo "$t $1" >> "$log_dir/../uwi.log"
  fi
}

# convert the output of given command to single line
single_line()
{
	tr -d '\n' <<< $($@)
	echo ''
}

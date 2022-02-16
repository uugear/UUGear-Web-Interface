#!/bin/bash

# include uwi.conf and common.sh in the same directory
my_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
. "$my_dir/uwi.conf"
. "$my_dir/common/common.sh"

# collect all sub folders
sub_folders=($(find "$my_dir" -maxdepth 1 -mindepth 1 -type d))
log $(printf "[%s]" "${sub_folders[@]}")

# process received composite message
while read comp_msg; do
log "Received: $comp_msg"

# split composite message to multiple messages
IFS='#' read -ra msgs <<< "$comp_msg"
msg_count=${#msgs[@]}
output=''

# process all messages
for ((j=0; j<$msg_count; j++)); do

	log "Processing: ${msgs[$j]}"

  # split message to fields
  IFS='|' read -ra fields <<< ${msgs[$j]}
  count=${#fields[@]}

  if [[ $count -ge 2 ]]; then
    # the first field must be the name of a sub folder
    if [[ " ${sub_folders[@]} " =~ " $my_dir/${fields[0]} " ]] ; then
      dir=${fields[0]}
      cmd="$my_dir/$dir/api.sh"
      if [[ -r $cmd ]]; then
        # call function in script
        func=$(printf %q "${fields[1]}")
        # the function must exist in specified file
        if grep -q "$func()" "$cmd"; then
          cmd=". $cmd; . $my_dir/common/common.sh; . $my_dir/common/gpio-util.sh; $func"
          for ((i = 2 ; i < $count ; i++)); do
            param=$(printf %q "${fields[$i]}")
            cmd="$cmd $param"
          done
        else
          log "The function $func() doesn't exist in file $cmd"
        fi
        log "Enter directory ${!dir}"
        cd ${!dir}
        log "Execute: bash -c \"$cmd\""
        result=$(bash -c "$cmd")
        # concatenate results with \n
        if [ -z "$output" ]; then
          output="$result"
        else
          output="$output\n$result"
        fi
      else
        log "File $cmd is not readable."
      fi
    else
    log "Device '${fields[0]}' not found."
    fi
  else
    log "Message doesn't contain enough fields."
  fi
done
# response for composite message
log "Response: $output"
echo "$output"
done

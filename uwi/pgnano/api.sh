#!/bin/bash

my_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
. "$my_dir/../uwi.conf"
. "$my_dir/../common/common.sh"
. "$pgnano/utilities.sh"

api_has_hardware()
{	
	local result=$(i2cdetect -y 1)
  if (( ${#result} >= 450 )); then
    if [[ "${result:133:2}" == "18" && "${result:162:2}" == "20" && ("${result:324:2}" == "51" || "${result:324:2}" == "UU")]]; then
		  echo "yes"
		else
		  echo "no"
		fi
	else
		echo "no"
	fi
}

api_has_software()
{
  if [[ -d "$pgnano" ]]; then
    echo "yes"
  else
    echo "no"
  fi
}

api_is_buzzer_on()
{
  if [[ "$(gpio -g read 25)" == '1' ]]; then
    echo 'yes'
  else
    echo 'no'
  fi
}

api_buzzer_on()
{
  gpio -g mode 25 out
  gpio -g write 25 1
}

api_buzzer_off()
{
  gpio -g mode 25 out
  gpio -g write 25 0
}

api_is_red_led_on()
{
  if [[ "$(gpio -g read 26)" == '1' ]]; then
    echo 'yes'
  else
    echo 'no'
  fi
}

api_red_led_on()
{
  gpio -g mode 26 out
  gpio -g write 26 1
}

api_red_led_off()
{
  gpio -g mode 26 out
  gpio -g write 26 0
}

api_get_sys_time()
{
  get_sys_time
}

api_get_rtc_time()
{
  get_rtc_time
}

api_rtc_to_sys()
{
  rtc_to_system
}

api_sys_to_rtc()
{
  system_to_rtc
}

api_network_sync()
{
  net_to_system
  system_to_rtc
}

api_get_alarm_time()
{
  local alarm=$(get_alarm_time)
  if [[ "$alarm" == 'disabled' ]]; then
    echo $alarm
  else
    alarm=$(get_local_date_time "$alarm")
    local ts=$(get_rtc_timestamp)
    local ym=$(date +'%Y-%m-' -d @$ts)
    echo "$ym$alarm"
  fi
}

api_set_alarm_time()
{
  when=$(get_utc_date_time $1 $2 $3 $4)
	IFS=' ' read -r date timestr <<< "$when"
  IFS=':' read -r hour minute second <<< "$timestr"
  set_alarm_time $date $hour $minute $second
}

api_clear_alarm_time()
{
  set_alarm_time 00 00 00 00
}

api_is_watchdog_on()
{
  if [ ! -f "$pgnano_home/watchdog.pid" ]; then
    echo 'no'
  else
    echo 'yes'
  fi
}

api_turn_on_watchdog()
{
  watchdog_on
}

api_turn_off_watchdog()
{
  watchdog_off
}

api_get_do()
{
  get_do_value $1
}

api_set_do()
{
  set_do_value $1 $2
}

api_toggle_do()
{
  local v=$(get_do_value $1)
  if [[ $v -eq 0 ]]; then
    set_do_value $1 1
  else
    set_do_value $1 0
  fi
}

api_get_di()
{
  get_di_value $1
}

api_get_dio_modes()
{
  echo "$(get_dio_mode 1 | xargs)$(get_dio_mode 2 | xargs)$(get_dio_mode 3 | xargs)$(get_dio_mode 4 | xargs)"
}

api_set_dio_modes()
{
  if [[ "$1" == 'ININININ' ]]; then
    set_dio_in_in_in_in
  elif [[ "$1" == 'ININOUTOUT' ]]; then
    set_dio_in_in_out_out
  elif [[ "$1" == 'OUTOUTININ' ]]; then
    set_dio_out_out_in_in
  elif [[ "$1" == 'OUTOUTOUTOUT' ]]; then
    set_dio_out_out_out_out
  else
    echo "Not supported modes: $1"
  fi
}

api_get_dio_value()
{
  get_dio_value $1
}

api_toggle_dio()
{
  local v=$(get_dio_value $1)
  if [[ $v -eq 1 ]]; then
    set_dio_output_value $1 0
  else
    set_dio_output_value $1 1
  fi
}

api_set_adc_sps()
{
  set_adc_sps $1
}

api_set_adc_pga()
{
  set_adc_pga $1
}

api_get_adc_all_info()
{
  local sps=$(get_adc_sps)
  local pga=$(get_adc_pga)
  local max=$(get_adc_max_code $sps)
  
  local raw1=$(get_adc_raw 1)
  set_adc_pga $pga
  local raw2=$(get_adc_raw 2)
  set_adc_pga $pga
  local raw3=$(get_adc_raw 3)
  set_adc_pga $pga
  local raw4=$(get_adc_raw 4)
  set_adc_pga $pga

  local volt1=$(get_adc_volt_by_raw $pga $max $raw1)
  local volt2=$(get_adc_volt_by_raw $pga $max $raw2)
  local volt3=$(get_adc_volt_by_raw $pga $max $raw3)
  local volt4=$(get_adc_volt_by_raw $pga $max $raw4)

  echo "{\"sps\":\"$sps\",\"pga\":\"$pga\",\"raw1\":\"$raw1\",\"raw2\":\"$raw2\",\"raw3\":\"$raw3\",\"raw4\":\"$raw4\",\"volt1\":\"$volt1\",\"volt2\":\"$volt2\",\"volt3\":\"$volt3\",\"volt4\":\"$volt4\"}"
}
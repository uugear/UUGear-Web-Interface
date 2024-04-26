#!/bin/bash

my_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
. "$my_dir/../uwi.conf"
. "$my_dir/../common/common.sh"
. "$wittypi4/utilities.sh"

api_has_hardware()
{
  result=$(i2cdetect -y 1)
  if (( ${#result} >= 450 )); then
    value=${result:80:2}
    if [ "$value" == "08" ]; then
      model=$(i2cget -y 1 8 0)
      if [ "$model" == "0x36" ]; then
        echo "mini"
      elif [ "$model" == "0x26" ]; then
        echo "full"
      elif [ "$model" == "0x37" ]; then
        echo "l3v7"
      else
        echo "unknown"
      fi
		else
		  echo "no"
		fi
	else
		echo "no"
	fi
}

api_has_software()
{
  if [[ -d "$wittypi4" ]]; then
    echo "yes"
  else
    echo "no"
  fi
}

api_get_firmware_rev()
{
  local fwRev=$(i2cget -y 1 8 12)
  printf "%d" $fwRev
}

api_get_temperature()
{
	get_temperature
}

api_get_sys_time()
{
	get_sys_time
}

api_get_rtc_time()
{
	get_rtc_time
}

api_get_power_mode()
{
	get_power_mode
}

api_get_input_voltage()
{
	get_input_voltage
}

api_get_output_voltage()
{
	get_output_voltage
}

api_get_output_current()
{
	get_output_current
}

api_get_shutdown_time()
{
	get_shutdown_time
}

api_set_shutdown_time()
{
  set_shutdown_time $1 $2 $3 $4
  echo 'OK'
}

api_clear_shutdown_time()
{
	clear_shutdown_time
	echo 'OK'
}

api_get_startup_time()
{
	get_startup_time
}

api_set_startup_time()
{
  set_startup_time $1 $2 $3 $4
  echo 'OK'
}

api_clear_startup_time()
{
	clear_startup_time
	echo 'OK'
}

api_system_to_rtc()
{
	system_to_rtc
	echo 'OK'
}

api_rtc_to_system()
{
	rtc_to_system
	echo 'OK'
}

api_sync_time()
{
  if $(has_internet) ; then
    net_to_system
    system_to_rtc
    echo 'OK'
  else
    echo 'No Internet'
  fi
}

api_list_scripts()
{
	local list=''
	for file in $wittypi4/schedules/*.wpi
	do
	  if [[ -f $file ]]; then
	  	local name=$(basename $file)
	  	if [ -z "$list" ]; then
	  		list=$name
	  	else
	    	list="$list|$name"
	  	fi
	  fi
	done
	echo "$list"
}

api_script_inuse()
{
	if [ -f "$wittypi4/schedule.wpi" ]; then
		echo 'yes'
	else
		echo 'no'
	fi
}

api_current_script()
{
	if [ -f "$wittypi4/schedule.wpi" ]; then
		script=$(base64 "$wittypi4/schedule.wpi")
		script=${script//$'\n'}
	fi
	echo "$script"
}

api_load_script()
{
	if [ -f "$wittypi4/schedules/$1" ]; then
		script=$(base64 "$wittypi4/schedules/$1")
		script=${script//$'\n'}
	fi
	echo "$script"
}

api_apply_script()
{
	if [[ -z "$1" ]]; then
		clear_shutdown_time
		clear_startup_time
		rm "$wittypi4/schedule.wpi"
  else
  	local script=$(echo "$1" | base64 -d)
    echo "$script" > "$wittypi4/schedule.wpi"
    "$wittypi4/runScript.sh">>"$wittypi4/schedule.log" 2>&1
	fi
	echo 'OK'
}

api_get_low_voltage()
{
  get_low_voltage_threshold
}

api_get_recovery_voltage()
{
  get_recovery_voltage_threshold
}

api_get_default_state()
{
  local ds=$(i2c_read 0x01 $I2C_MC_ADDRESS $I2C_CONF_DEFAULT_ON)
  if [[ $ds -eq 0 ]]; then
    echo 'OFF'
	else
    echo 'ON'
  fi
}

api_get_cut_power_delay()
{
  local pcd=$(i2c_read 0x01 $I2C_MC_ADDRESS $I2C_CONF_POWER_CUT_DELAY)
  pcd=$(calc $(($pcd))/10)
  printf '%.1f seconds\n' "$pcd"
}

api_get_pulsing_interval()
{
  local pi=$(i2c_read 0x01 $I2C_MC_ADDRESS $I2C_CONF_PULSE_INTERVAL)
  printf '%d seconds\n' "$pi"
}

api_get_led_duration()
{
  local led=$(i2c_read 0x01 $I2C_MC_ADDRESS $I2C_CONF_BLINK_LED)
  printf '%d\n' "$led"
}

api_get_dummy_load_duration()
{
  local dload=$(i2c_read 0x01 $I2C_MC_ADDRESS $I2C_CONF_DUMMY_LOAD)
  printf '%d\n' "$dload"
}

api_get_vin_adjustment()
{
  local vinAdj=$(i2c_read 0x01 $I2C_MC_ADDRESS $I2C_CONF_ADJ_VIN)
  if [[ $vinAdj -gt 127 ]]; then
  	vinAdj=$(calc $((128-$vinAdj))/100)
 	else
 		vinAdj=$(calc $(($vinAdj))/100)
  fi
  printf '%.2fV\n' "$vinAdj"
}

api_get_vout_adjustment()
{
  local voutAdj=$(i2c_read 0x01 $I2C_MC_ADDRESS $I2C_CONF_ADJ_VOUT)
  if [[ $voutAdj -gt 127 ]]; then
  	voutAdj=$(calc $((128-$voutAdj))/100)
 	else
 		voutAdj=$(calc $(($voutAdj))/100)
  fi
  printf '%.2fV\n' "$voutAdj"
}

api_get_iout_adjustment()
{
  local ioutAdj=$(i2c_read 0x01 $I2C_MC_ADDRESS $I2C_CONF_ADJ_IOUT)
  if [[ $ioutAdj -gt 127 ]]; then
  	ioutAdj=$(calc $((128-$ioutAdj))/100)
 	else
 		ioutAdj=$(calc $(($ioutAdj))/100)
  fi
  printf '%.2fA\n' "$ioutAdj"
}

api_set_low_voltage()
{
  if (( $1 == 0 )); then
    i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_LOW_VOLTAGE 0xFF > /dev/null 2>&1
  else
    i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_LOW_VOLTAGE $1 > /dev/null 2>&1
  fi
  echo 'OK'
}

api_set_recovery_voltage()
{
  if (( $1 == 0 )); then
    i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_RECOVERY_VOLTAGE 0xFF > /dev/null 2>&1
  else
    i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_RECOVERY_VOLTAGE $1 > /dev/null 2>&1
  fi
  echo 'OK'
}

api_set_usb_connect_action()
{
  i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_RECOVERY_VOLTAGE $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_default_state()
{
  i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_DEFAULT_ON $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_cut_power_delay()
{
  i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_POWER_CUT_DELAY $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_pulsing_interval()
{
  i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_PULSE_INTERVAL $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_led_duration()
{
  i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_BLINK_LED $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_dummy_load_duration()
{
  i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_DUMMY_LOAD $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_vin_adjustment()
{
  i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_ADJ_VIN $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_vout_adjustment()
{
  i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_ADJ_VOUT $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_iout_adjustment()
{
  i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_ADJ_IOUT $1 > /dev/null 2>&1
  echo 'OK'
}

api_over_temperature_action()
{
  local res=$(over_temperature_action)
  if [[ -z "$res" ]]; then
    echo 'not set'
  else
    echo $res
  fi
}

api_set_over_temperature_action()
{
  set_over_temperature_action $1 $2
}

api_clear_over_temperature_action()
{
  clear_over_temperature_action
}

api_below_temperature_action()
{
  local res=$(below_temperature_action)
  if [[ -z "$res" ]]; then
    echo 'not set'
  else
    echo $res
  fi
}

api_set_below_temperature_action()
{
  set_below_temperature_action $1 $2
}

api_clear_below_temperature_action()
{
  clear_below_temperature_action
}

api_get_battery_status()
{
  local gp5=$(gpio -g read 5)
  local gp6=$(gpio -g read 6)
  if [ "$gp5" == "1" ] && [ "$gp6" == "1" ]; then
    echo 'discharging'
  elif [ "$gp5" == "0" ] && [ "$gp6" == "1" ]; then
    echo 'charging'  
  fi
}

api_get_default_on_delay()
{
  local dod=$(i2c_read 0x01 $I2C_MC_ADDRESS $I2C_CONF_DEFAULT_ON_DELAY)
  printf '%d\n' "$dod"
}

api_set_default_on_delay()
{
  i2c_write 0x01 $I2C_MC_ADDRESS $I2C_CONF_DEFAULT_ON_DELAY $1
  echo 'OK'
}

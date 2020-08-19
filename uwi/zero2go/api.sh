#!/bin/bash

my_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
. "$my_dir/../uwi.conf"
. "$my_dir/../common/common.sh"
. "$zero2go/utilities.sh"

api_has_hardware()
{
  result=$(i2cdetect -y 1)
  if (( ${#result} >= 450 )); then
    value=${result:189:2}
    if [ "$value" == "29" ]; then
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
  if [[ -d "$zero2go" ]]; then
    echo "yes"
  else
    echo "no"
  fi
}

api_read_channel_A()
{
  read_channel_A
}

api_read_channel_B()
{
  read_channel_B
}

api_read_channel_C()
{
  read_channel_C
}

api_get_working_mode()
{
  local mode=$(i2c_read 0x01 $I2C_SLAVE_ADDRESS $I2C_BULK_BOOST)
  if [ $mode == '0x01' ]; then
    echo 'Step-Down'
  else
    echo 'Step-Up'
  fi
}

api_get_default_state()
{
  local default=$(i2c_read 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_DEFAULT_ON)
  if [ $default == '0x01' ]; then
    echo 'ON'
  else
	  echo 'OFF'
  fi
}

api_get_blinking_interval()
{
  local blink=$(i2c_read 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_BLINK_INTERVAL)
  if [ $blink == '0x09' ]; then
    echo '8 Seconds'
  elif [ $blink == '0x07' ]; then
	  echo '2 Seconds'
	elif [ $blink == '0x06' ]; then
	  echo '1 Second'
	else
	  echo '4 Seconds'
  fi
}

api_get_cut_power_delay()
{
  local delay=$(i2c_read 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_POWER_CUT_DELAY)
  delay=$(calc $(($delay))/10)
  echo "$delay Seconds"
}

api_get_low_voltage()
{
  local lowv=$(i2c_read 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_LOW_VOLTAGE)
  if [ $(($lowv)) == 255 ]; then
    echo 'Disabled'
	else
	  lowv=$(calc $(($lowv))/10)
	  lowv+='V'
	  echo "$lowv"
  fi
}

api_get_recovery_voltage()
{
  local recv=$(i2c_read 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_RECOVERY_VOLTAGE)
  if [ $(($recv)) == 255 ]; then
    echo 'Disabled'
	else
    recv=$(calc $(($recv))/10)
	  recv+='V'
	  echo "$recv"
  fi
}

api_get_bulk_alwayson()
{
  local alwayson=$(i2c_read 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_BULK_ALWAYS_ON)
  if [ $alwayson == '0x01' ]; then
    echo 'Yes'
  else
    echo 'No'
  fi
}

api_set_default_state()
{
  i2c_write 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_DEFAULT_ON $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_blinking_interval()
{
  i2c_write 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_BLINK_INTERVAL $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_cut_power_delay()
{
  i2c_write 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_POWER_CUT_DELAY $1 > /dev/null 2>&1
  echo 'OK'
}

api_set_low_voltage()
{
  if (( $1 == 0 )); then
    i2c_write 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_LOW_VOLTAGE 0xFF > /dev/null 2>&1
  else
    i2c_write 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_LOW_VOLTAGE $1 > /dev/null 2>&1
  fi
  echo 'OK'
}

api_set_recovery_voltage()
{
  if (( $1 == 0 )); then
    i2c_write 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_RECOVERY_VOLTAGE 0xFF > /dev/null 2>&1
  else
    i2c_write 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_RECOVERY_VOLTAGE $1 > /dev/null 2>&1
  fi
  echo 'OK'
}

api_set_bulk_alwayson()
{
  i2c_write 0x01 $I2C_SLAVE_ADDRESS $I2C_CONF_BULK_ALWAYS_ON $1 > /dev/null 2>&1
  echo 'OK'
}
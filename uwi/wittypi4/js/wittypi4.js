var missingWittyPi4 = function() {
  var dlg = $('#MissingWittyPi4');
  if (dlg.length == 0 || !dlg.dialog('isOpen')) {
    dlg.remove();
    dlg = $("<div id='MissingWittyPi4' title='Witty Pi 4 not found'><p>Witty Pi 4 uses I2C address 0x08. However this address is not listed when running \"i2cdetect -y 1\".</p><p>Please check the physical connection between Witty Pi 4 and Raspberry Pi.</p></div>");
    dlg.dialog({
      autoOpen: true,
      closeOnEscape: false,
      height: 160,
      width: 550,
      modal: true,
      buttons: {},
      show: 'fade',
      hide: 'fade'
    });
  }
};

var missingSoftware = function() {
  var dlg = $('#MissingSoftware');
  if (dlg.length == 0 || !dlg.dialog('isOpen')) {
    dlg.remove();
    dlg = $("<div id='MissingSoftware' title='Witty Pi 4 software missing'><p>Witty Pi 4's software should be installed beforehand.</p><p>Usually it is installed to the \"/home/pi/wittypi\" directory. If it was installed to a different location, please configure accordingly in the \"uwi.conf\" file.</p></div>");
    dlg.dialog({
      autoOpen: true,
      closeOnEscape: false,
      height: 160,
      width: 550,
      modal: true,
      buttons: {},
      show: 'fade',
      hide: 'fade'
    });
  }
};

var refreshOverview = function() {
  var vin = $('#v_in');
  sharedWS.addCompositeTask([
    { msg: 'wittypi4|api_get_temperature', callback: function(event) {
      $('#temperature').text(event.data);
    }},
    { msg: 'wittypi4|api_get_sys_time', callback: function(event) {
      $('#rpi_time').text(event.data);
    }},
    { msg: 'wittypi4|api_get_rtc_time', callback: function(event) {
      $('#rtc_time').text(event.data);
    }},
    { msg: 'wittypi4|api_get_power_mode', callback: function(event) {
      if (event.data != 0) {
        vin.show();
      } else {
        vin.hide();
      }
    }},
    { msg: 'wittypi4|api_get_input_voltage', callback: function(event) {
      if (vin.is(":visible")) {
        vin.text('Vin=' + Number(event.data).toFixed(2) + 'V, ');
      }
    }},
    { msg: 'wittypi4|api_get_output_voltage', callback: function(event) {
      $('#v_out').text('Vout=' + Number(event.data).toFixed(2) + 'V, ');
    }},
    { msg: 'wittypi4|api_get_output_current', callback: function(event) {
      $('#i_out').text('Iout=' + Number(event.data).toFixed(2) + 'A');
    }},
    { msg: 'wittypi4|api_get_battery_status', callback: function(event) {
      var bs = $('#battery_status').empty();
      if ($('.revInfo').text() == 'L3V7' && (event.data == 'charging' || event.data == 'discharging')) {
        bs.append('<img src="img/' + event.data + '.gif" style="margin-left:20px;vertical-align: middle" title="' + event.data + '"/>');
      }
    }}
  ], true);
};

var refreshSchedule = function() {
  sharedWS.addCompositeTask([
    { msg: 'wittypi4|api_get_shutdown_time', callback: function(event) {
      $('#shutdown_time').html(format_date_time(event.data, "not set"));
    }},
    { msg: 'wittypi4|api_get_startup_time', callback: function(event) {
      $('#startup_time').html(format_date_time(event.data, "not set"));
    }},
    { msg: 'wittypi4|api_script_inuse', callback: function(event) {
      $('#schedule_script').html(event.data == 'no' ? "(not in use)" : " (in use) ");
    }}
  ], true);
};

var refreshSettings = function() {
	sharedWS.addCompositeTask([
    { msg: 'wittypi4|api_get_low_voltage', callback: function(event) {
      $('#low_voltage').text(event.data);
    }},
    { msg: 'wittypi4|api_get_recovery_voltage', callback: function(event) {
      $('#recovery_voltage').text(event.data);
      if ($('#usbConnAction').is(":visible")) {
        $('#usb_connect_action').text(event.data == '0V' ? 'do nothing' : 'power on'); 
      }
    }},
    { msg: 'wittypi4|api_get_default_state', callback: function(event) {
    	on_default_state_updated(event.data);
    }},
    { msg: 'wittypi4|api_get_default_on_delay', callback: function(event) {
      $('#default_on_delay').text(event.data + ' seconds');
	  }},
    { msg: 'wittypi4|api_get_cut_power_delay', callback: function(event) {
      $('#cut_power_delay').text(event.data);
    }},
    { msg: 'wittypi4|api_get_pulsing_interval', callback: function(event) {
      $('#pulsing_interval').text(event.data);
    }},
    { msg: 'wittypi4|api_get_led_duration', callback: function(event) {
      $('#led_duration').text(event.data + " milliseconds");
    }},
    { msg: 'wittypi4|api_get_dummy_load_duration', callback: function(event) {
      $('#dummy_load_duration').text(event.data + " milliseconds");
    }},
    { msg: 'wittypi4|api_get_vin_adjustment', callback: function(event) {
      $('#vin_adjustment').text(event.data);
    }},
    { msg: 'wittypi4|api_get_vout_adjustment', callback: function(event) {
      $('#vout_adjustment').text(event.data);
    }},
    { msg: 'wittypi4|api_get_iout_adjustment', callback: function(event) {
      $('#iout_adjustment').text(event.data);
    }},
  ], true);
};

var refreshTemperatureActions = function() {
  sharedWS.addCompositeTask([
    { msg: 'wittypi4|api_over_temperature_action', callback: function(event) {
      $('#over_temperature_action').text(event.data);
    }},
    { msg: 'wittypi4|api_below_temperature_action', callback: function(event) {
      $('#below_temperature_action').text(event.data);
    }}
  ], true);
};

var refresh = function() {
  refreshOverview();
  refreshSchedule();
  refreshTemperatureActions();
  refreshSettings();
};

var pad = function(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

var format_date_time = function(datetime, defVal) {
  if (datetime == "00 00:00:00" || datetime == " :" || datetime == " ::") {
    return defVal;
  }
  var d = datetime.split(' ')[0];
  var now = new Date();
  if (d >= now.getDate()) {
    return now.getFullYear() + '-' + pad(now.getMonth() + 1, 2) + '-' + datetime;
  } else {
    var nextMonth;
    if (now.getMonth() == 11) {
        nextMonth = new Date(now.getFullYear() + 1, 0, d);
    } else {
       nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, d);
    }
    return nextMonth.getFullYear() + '-' + pad(nextMonth.getMonth() + 1, 2) + '-' + datetime;
  }
}; 

var sys_to_rtc = function() {
  sharedWS.addTask('wittypi4|api_system_to_rtc', function(event) {
    refreshOverview();
  });
};

var rtc_to_sys = function() {
  sharedWS.addTask('wittypi4|api_rtc_to_system', function(event) {
    refreshOverview();
  });
};

var sync = function() {
  sharedWS.addTask('wittypi4|api_sync_time', function(event) {
    refreshOverview();
  });
};

var editDateTime = function(dlgTitle, curVal, callBack) {
  $('#dlg').remove();
  var v = curVal.length > 0 ? curVal.split(" ") : ["", ""];
  var dlg = $("<div id='dlg' title='" + dlgTitle + "'></div>").appendTo('body');
  dlg.append("<span autofocus>Date: </span><input type='text' placeholder='YYYY-MM-DD' id='datepicker' value='" + v[0] + "'> Time: <input type='text' placeholder='hh:mm:ss' id='timepicker' value='" + v[1] + "'/>");
  $('#datepicker').datepicker({ dateFormat: 'yy-mm-dd', minDate: 0, maxDate: "+1M -1D" });
  $('#timepicker').timepicker({
      timeFormat: 'HH:mm:ss',
      interval: '15',
      startTime: '00:00',
      dynamic: false,
      dropdown: true,
      scrollbar: true,
      zindex: 1000
  });
  dlg.dialog({
      resizable: false,
      height: "auto",
      width: 600,
      modal: true,
      buttons: {
        OK: function() {
          $(this).dialog("close");
          callBack($.trim($('#datepicker').val() + " " + $('#timepicker').val()));
        },
        Cancel: function() {
          $(this).dialog("close");
        }
      }
   });
};

var next_shutdown = function() {
  editDateTime("Schedule Next Shutdown:", $.trim($('#shutdown_time').text()), save_shutdown);
};

var next_startup = function() {
  editDateTime("Schedule Next Startup:", $.trim($('#startup_time').text()), save_startup);
};

var save_shutdown = function(dt) {
  if (dt.length > 0) {
    dt = dt.split(' ');
    day = dt[0].split('-')[2];
    t = dt[1].split(':');
    sharedWS.addTask('wittypi4|api_set_shutdown_time|' + day + '|' + t[0] + '|' + t[1] + '|' + t[2], function(event) {
      refreshSchedule();
    });
  } else {
    sharedWS.addTask('wittypi4|api_clear_shutdown_time', function(event) {
      refreshSchedule();
    });
  }
};

var save_startup = function(dt) {
  if (dt.length > 0) {
    dt = dt.split(' ');
    day = dt[0].split('-')[2];
    t = dt[1].split(':');
    sharedWS.addTask('wittypi4|api_set_startup_time|' + day + '|' + t[0] + '|' + t[1] + '|' + t[2], function(event) {
      refreshSchedule();
    });
  } else {
    sharedWS.addTask('wittypi4|api_clear_startup_time', function(event) {
      refreshSchedule();
    });
  }
};

var list_scripts = function(d) {
  var dlg = $(d);
  var btn = dlg.parent().find("button:contains('Load')");
  btn.button('disable');
  sharedWS.addTask('wittypi4|api_list_scripts', function(event) {
    var code = '';
    var scripts = event.data.split('|');
    for (index = 0; index < scripts.length; index++) { 
      code += '<li><div>' + scripts[index] + '</div></li>';
    } 
    $('#menuPopup').remove();  
    var menuPopup = $("<div id='menuPopup'><ul id='scriptMenu'>" + code + "</ul></div>").appendTo(dlg);  
    $('#scriptMenu').menu({
      select: function(ev, ui){
        sharedWS.addTask('wittypi4|api_load_script|' + ui.item[0].innerText, function(event) {
          $('#script').val(atob(event.data));
        });
        $('#menuPopup').dialog("close");
      }  
    });
    menuPopup.dialog({
      width: "auto",
      resizable: false,
      open: function(){
        $(this).css({'padding':'0px','min-height':'auto'}).parent().find(".ui-dialog-titlebar").hide().parent().css({'padding':'0px','border':'none'});
       }
    });
    btn.button('enable');
  });
};

var set_script = function() {
  $('#dlg').remove();
  var dlg = $("<div id='dlg' title='Schedule Script:'><textarea id='script' cols='68' rows='20'></textarea></div>").appendTo('body');
  dlg.dialog({
      resizable: false,
      height: "auto",
      width: 600,
      modal: true,
      buttons: [
        { text:"Load", click:function(){
            list_scripts(this);
          }
        },
        { text:"ScriptGen...", style:"margin-right:220px", click:function(){
            window.open('http://www.uugear.com/app/wittypi-scriptgen/', '_blank');
          }
        },
        { text:"OK", click:function(){
            sharedWS.addTask('wittypi4|api_apply_script|' + btoa($('#script').val()), function(event) {
              refreshSchedule();
            });
            $(this).dialog("close");
          }
        },
        { text:"Cancel", click:function(){
            $(this).dialog("close");
          }
        }
      ],
     close: function() {
         $('#menuPopup').remove();
     }
  });
  sharedWS.addTask('wittypi4|api_current_script', function(event) {
    $('#script').val(atob(event.data));
  });
};

var set_low_voltage = function() {
	var curVal = parseFloat($('#low_voltage').text());
	if (Number.isNaN(curVal)) {
	  curVal = 0;	
	}
  var model = $('.revInfo').text();
  var maxVal = (model == 'L3V7' ? 4.2 : 25.0);
  var minVal = (model == 'L3V7' ? 3.0 : 0);
  inputValue('Low Voltage Threshold',
	  'Please input the low voltage threshold (0=disabled):',
	  curVal,
	  minVal,
	  maxVal,
	  '0.1',
	  'V',
	  function(val) {
	  	if (val != null && val >= 0 && val <= 25) {
        sharedWS.addCompositeTask([
		    { msg: 'wittypi4|api_set_low_voltage|' + parseInt(val*10), callback: function(event) {
		    }},
		    { msg: 'wittypi4|api_get_low_voltage', callback: function(event) {
	       $('#low_voltage').text(event.data);
	      }}
		  ]);
	    } else {
	      msgBox('Low Voltage Threshold', 'The input value is invalid. It should be a value between 0 and 25.');	
	    }
	  }
	);
};

var set_recovery_voltage = function() {
	var curVal = parseFloat($('#recovery_voltage').text());
	if (Number.isNaN(curVal)) {
	  curVal = 0;	
	}
  inputValue('Recovery Voltage Threshold',
	  'Please input the recovery voltage threshold (0=disabled):',
	  curVal,
	  '0',
	  '25.0',
	  '0.1',
	  'V',
	  function(val) {
	  	if (val != null && val >= 0 && val <= 25) {
        sharedWS.addCompositeTask([
  		    { msg: 'wittypi4|api_set_recovery_voltage|' + parseInt(val*10), callback: function(event) {
  		    }},
  		    { msg: 'wittypi4|api_get_recovery_voltage', callback: function(event) {
  	       $('#recovery_voltage').text(event.data);
  	      }}
		    ]);
	    } else {
	      msgBox('Recovery Voltage Threshold', 'The input value is invalid. It should be a value between 0 and 25.');	
	    }
	  }
	);
};

var set_default_state = function() {
	chooseValue('Default State', 
	  'Please choose the default state when the device is powered:',
	  [0, 1],
	  ['OFF', 'ON'],
	  $('#default_state').text() == 'ON' ? 1 : 0,
	  function(val) {
	  	sharedWS.addCompositeTask([
		    { msg: 'wittypi4|api_set_default_state|' + val, callback: function(event) {
		    }},
		    { msg: 'wittypi4|api_get_default_state', callback: function(event) {
		      on_default_state_updated(event.data);
		    }}
		  ]);
	  }
	);
};

var on_default_state_updated = function(newState) {
  $('#default_state').text(newState);
  if ($('.fwRev').text() >= 2) {
    $('#defaultOnDelay').css('display', newState == 'ON' ? 'block' : 'none');
  }
};

var set_cut_power_delay = function() {
	var maxv = is_rev2 ? 25 : 8;
	inputValue('Power Cut Delay',
	  'Please input the delay between shutdown and power cut:',
	  parseFloat($('#cut_power_delay').text()),
	  '0',
	  maxv + '.0',
	  '0.1',
	  'seconds',
	  function(val) {
	  	if (val != null && val >= 0 && val <= maxv) {
        sharedWS.addCompositeTask([
		    { msg: 'wittypi4|api_set_cut_power_delay|' + parseInt(val*10), callback: function(event) {
		    }},
		    { msg: 'wittypi4|api_get_cut_power_delay', callback: function(event) {
	       $('#cut_power_delay').text(event.data);
	      }}
		  ]);
	    } else {
	      msgBox('Power Cut Delay', 'The input value is invalid. It should be a value between 0 and ' + maxv + '.');	
	    }
	  }
	);
};

var set_pulsing_interval = function() {
	inputValue('Pulsing Interval',
	  'Please input the pulsing interval when the device is sleeping.<br/>This will affect the LED blinking and dummy load (if enabled).',
	  parseFloat($('#pulsing_interval').text()),
	  '1',
	  '20',
	  '1',
	  'seconds',
	  function(val) {
	  	if (val != null && val >= 1 && val <= 20) {
        sharedWS.addCompositeTask([
		    { msg: 'wittypi4|api_set_pulsing_interval|' + parseInt(val), callback: function(event) {
		    }},
		    { msg: 'wittypi4|api_get_pulsing_interval', callback: function(event) {
	       $('#pulsing_interval').text(event.data);
	      }}
		  ]);
	    } else {
	      msgBox('Pulsing Interval', 'The input value is invalid. It should be a value between 1 and 20.');	
	    }
	  }
	);
};

var set_led_duration = function() {
	inputValue('White LED Duration',
	  'Please input the duration for lighting up the white LED, when the pulse comes:',
	  parseInt($('#led_duration').text()),
	  '0',
	  '255',
	  '1',
	  false,
	  function(val) {
	  	if (val != null && val >= 0 && val <= 255) {
        sharedWS.addCompositeTask([
		    { msg: 'wittypi4|api_set_led_duration|' + parseInt(val), callback: function(event) {
		    }},
		    { msg: 'wittypi4|api_get_led_duration', callback: function(event) {
	       $('#led_duration').text(event.data + " milliseconds");
	      }}
		  ]);
	    } else {
	      msgBox('White LED Duration', 'The input value is invalid. It should be a value between 0 and 255.');	
	    }
	  }
	);
};

var set_dummy_load_duration = function() {
	inputValue('Dummy Load Duration',
	  'Please input the duration (in ms) for applying dummy load, when the pulse comes:',
	  parseInt($('#dummy_load_duration').text()),
	  '0',
	  '255',
	  '1',
	  false,
	  function(val) {
	  	if (val != null && val >= 0 && val <= 255) {
        sharedWS.addCompositeTask([
		    { msg: 'wittypi4|api_set_dummy_load_duration|' + parseInt(val), callback: function(event) {
		    }},
		    { msg: 'wittypi4|api_get_dummy_load_duration', callback: function(event) {
	       $('#dummy_load_duration').text(event.data + " milliseconds");
	      }}
		  ]);
	    } else {
	      msgBox('Dummy Load Duration', 'The input value is invalid. It should be a value between 0 and 255.');	
	    }
	  }
	);
};

var set_vin_adjustment = function() {
	inputValue('Vin Adjustment',
	  'You can adjust the Vin by adding a small value to it:',
	  parseFloat($('#vin_adjustment').text()),
	  '-1.27',
	  '1.27',
	  '0.01',
	  'V',
	  function(val) {
	  	if (val != null && val >= 0 && val <= 255) {
        sharedWS.addCompositeTask([
		    { msg: 'wittypi4|api_set_vin_adjustment|' + parseInt(val*100), callback: function(event) {
		    }},
		    { msg: 'wittypi4|api_get_vin_adjustment', callback: function(event) {
	        $('#vin_adjustment').text(event.data);
	      }},
	      { msg: 'wittypi4|api_get_input_voltage', callback: function(event) {
	      	var vin = $('#v_in');
          if (vin.is(":visible")) {
            vin.text('Vin=' + Number(event.data).toFixed(2) + 'V, ');
          }
        }}
		  ]);
	    } else {
	      msgBox('Vin Adjustment', 'The input value is invalid. It should be a value between -1.27 and 1.27.');	
	    }
	  }
	);
};

var set_vout_adjustment = function() {
	inputValue('Vout Adjustment',
	  'You can adjust the Vout by adding a small value to it:',
	  parseFloat($('#vout_adjustment').text()),
	  '-1.27',
	  '1.27',
	  '0.01',
	  'V',
	  function(val) {
	  	if (val != null && val >= 0 && val <= 255) {
        sharedWS.addCompositeTask([
		    { msg: 'wittypi4|api_set_vout_adjustment|' + parseInt(val*100), callback: function(event) {
		    }},
		    { msg: 'wittypi4|api_get_vout_adjustment', callback: function(event) {
	        $('#vout_adjustment').text(event.data);
	      }},
	      { msg: 'wittypi4|api_get_output_voltage', callback: function(event) {
          $('#v_out').text('Vout=' + Number(event.data).toFixed(2) + 'V, ');
        }}
		  ]);
	    } else {
	      msgBox('Vout Adjustment', 'The input value is invalid. It should be a value between -1.27 and 1.27.');	
	    }
	  }
	);
};

var set_iout_adjustment = function() {
	inputValue('Iout Adjustment',
	  'You can adjust the Iout by adding a small value to it:',
	  parseFloat($('#iout_adjustment').text()),
	  '-1.27',
	  '1.27',
	  '0.01',
	  'A',
	  function(val) {
	  	if (val != null && val >= 0 && val <= 255) {
        sharedWS.addCompositeTask([
		    { msg: 'wittypi4|api_set_iout_adjustment|' + parseInt(val*100), callback: function(event) {
		    }},
		    { msg: 'wittypi4|api_get_iout_adjustment', callback: function(event) {
	        $('#iout_adjustment').text(event.data);
	      }},
	      { msg: 'wittypi4|api_get_output_current', callback: function(event) {
          $('#i_out').text('Iout=' + Number(event.data).toFixed(2) + 'A');
        }}
		  ]);
	    } else {
	      msgBox('Iout Adjustment', 'The input value is invalid. It should be a value between -1.27 and 1.27.');	
	    }
	  }
	);
};

var set_over_temperature_action = function() {
  var labels = ['None', 'Shutdown', 'Startup'];
  var data = $('#over_temperature_action').text().split(' ');
	var selIndex = labels.indexOf(data[2]);
  selIndex = (selIndex == -1) ? 0 : selIndex;
  var temp = parseInt(data[0].replace('T>', ''));
  temp = isNaN(temp) ? 80 : temp;
	chooseValue('Over Temperature Action',
	  'Please choose the action when temperature goes over the threshold.',
	  [0, 1, 2],
	  labels,
	  selIndex,
	  function(action) {
      if (action != 0) {
        inputValue('Over Temperature Threshold',
          'Please set the over temperature threshold:',
          temp,
          '-30',
          '80',
          '1',
          '&#8451;',
          function(point) {
            sharedWS.addTask('wittypi4|api_set_over_temperature_action|' + action + '|' + point, function(event) {
              refreshTemperatureActions();
            });
          });
      } else {
        sharedWS.addTask('wittypi4|api_clear_over_temperature_action', function(event) {
          refreshTemperatureActions();
        });
      }
	  }
	);	
};

var set_below_temperature_action = function() {
  var labels = ['None', 'Shutdown', 'Startup'];
  var data = $('#below_temperature_action').text().split(' ');
	var selIndex = labels.indexOf(data[2]);
  selIndex = (selIndex == -1) ? 0 : selIndex;
  var temp = parseInt(data[0].replace('T<', ''));
  temp = isNaN(temp) ? 75 : temp;
	chooseValue('Below Temperature Action',
	  'Please choose the action when temperature goes below the threshold.',
	  [0, 1, 2],
	  labels,
	  selIndex,
	  function(action) {
      if (action != 0) {
        inputValue('Below Temperature Threshold',
          'Please set the below temperature threshold:',
          temp,
          '-30',
          '80',
          '1',
          '&#8451;',
          function(point) {
            sharedWS.addTask('wittypi4|api_set_below_temperature_action|' + action + '|' + point, function(event) {
              refreshTemperatureActions();
            });
          });
      } else {
        sharedWS.addTask('wittypi4|api_clear_below_temperature_action', function(event) {
          refreshTemperatureActions();
        });
      }
	  }
	);
};

var set_usb_connect_action = function() {
  chooseValue('USB Connect Action',
	  'Please choose the action when USB power is connected.',
	  [1, 0],
	  ['power on', 'do nothing'],
	  $('#usb_connect_action').text() == 'do nothing' ? 1 : 0,
	  function(action) {
      sharedWS.addCompositeTask([
		    { msg: 'wittypi4|api_set_usb_connect_action|' + action, callback: function(event) {
		    }},
		    { msg: 'wittypi4|api_get_recovery_voltage', callback: function(event) {
	       $('#usb_connect_action').text(event.data == '0V' ? 'do nothing' : 'power on');
	      }}
	    ]);
	  }
	);	
};

var set_default_on_delay = function() {
  inputValue('Default On Delay',
	  'Please input the delay between power connection and Auto-Power-On:',
	  parseFloat($('#default_on_delay').text()),
	  '0',
	  '10',
	  '1',
	  'seconds',
	  function(val) {
	  	if (val != null && val >= 0 && val <= 10) {
        sharedWS.addCompositeTask([
          { msg: 'wittypi4|api_set_default_on_delay|' + parseInt(val), callback: function(event) {
          }},
          { msg: 'wittypi4|api_get_default_on_delay', callback: function(event) {
           $('#default_on_delay').text(event.data + ' seconds');
          }}
        ]);
	    } else {
	      msgBox('Default On Delay', 'The input value is invalid. It should be a value between 0 and 10.');	
	    }
	  }
	);
};
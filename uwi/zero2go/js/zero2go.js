var missingZero2Go = function() {
  var dlg = $('#missingZero2Go');
  if (dlg.length == 0 || !dlg.dialog('isOpen')) {
    dlg.remove();
    dlg = $("<div id='missingZero2Go' title='Zero2Go Omini not found'><p>Zero2Go Omini uses I2C address 0x29. However this address is not listed when running \"i2cdetect -y 1\".</p><p>Please check the physical connection between Zero2Go Omini and Raspberry Pi.</p></div>");
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
    dlg = $("<div id='MissingSoftware' title='Zero2Go Omini software missing'><p>Zero2Go Omini's software should be installed beforehand.</p><p>Usually it is installed to the \"/home/pi/zero2go\" directory. If it was installed to a different location, please configure accordingly in the \"uwi.conf\" file.</p></div>");
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
	var va, vb, vc;
	var cha = $('#cha');
	var chb = $('#chb');
	var chc = $('#chc');
  sharedWS.addCompositeTask([
    { msg: 'zero2go|api_read_channel_A', callback: function(event) {
    	va = parseFloat(event.data);
      cha.text(va.toFixed(2) + 'V');
    }},
    { msg: 'zero2go|api_read_channel_B', callback: function(event) {
    	vb = parseFloat(event.data);
      chb.text(vb.toFixed(2) + 'V');
    }},
    { msg: 'zero2go|api_read_channel_C', callback: function(event) {
    	vc = parseFloat(event.data);
      chc.text(vc.toFixed(2) + 'V');
    }},
    { msg: 'zero2go|api_get_working_mode', callback: function(event) {
      $('#work_mode').text(event.data);
      cha.removeClass('in_used');
      chb.removeClass('in_used');
      chc.removeClass('in_used');
      if (va > vb && va > vc) {
      	cha.addClass('in_used');
      } else if (vb > va && vb > vc) {
      	chb.addClass('in_used');
      } else {
      	chc.addClass('in_used');
      }
    }}
  ], true);
};

var refreshSettings = function() {
	sharedWS.addCompositeTask([
    { msg: 'zero2go|api_get_default_state', callback: function(event) {
    	$('#default_state').text(event.data);
    }},
    { msg: 'zero2go|api_get_blinking_interval', callback: function(event) {
      $('#blinking_interval').text(event.data);
    }},
    { msg: 'zero2go|api_get_cut_power_delay', callback: function(event) {
      $('#cut_power_delay').text(event.data);
    }},
    { msg: 'zero2go|api_get_low_voltage', callback: function(event) {
      $('#low_voltage').text(event.data);
    }},
    { msg: 'zero2go|api_get_recovery_voltage', callback: function(event) {
      $('#recovery_voltage').text(event.data);
    }},
    { msg: 'zero2go|api_get_bulk_alwayson', callback: function(event) {
      $('#bulk_alwayson').text(event.data);
    }}
  ], true);
};

var refresh = function() {
  refreshOverview();
  refreshSettings();
};

var set_default_state = function() {
	chooseValue('Default State', 
	  'Please choose the default state when the device is powered:',
	  [0, 1],
	  ['OFF', 'ON'],
	  $('#default_state').text() == 'ON' ? 1 : 0,
	  function(val) {
	  	sharedWS.addCompositeTask([
		    { msg: 'zero2go|api_set_default_state|' + val, callback: function(event) {
		    }},
		    { msg: 'zero2go|api_get_default_state', callback: function(event) {
		      $('#default_state').text(event.data);
		    }}
		  ]);
	  }
	);
};

var set_blinking_interval = function() {
	var labels = ['1 Second', '2 Seconds', '4 Seconds', '8 Seconds'];
	var selIndex = labels.indexOf($('#blinking_interval').text());
	chooseValue('Blinking Interval', 
	  'Please choose the blinking interval when the device is sleeping:',
	  [6, 7, 8, 9],
	  labels,
	  selIndex,
	  function(val) {
	  	sharedWS.addCompositeTask([
		    { msg: 'zero2go|api_set_blinking_interval|' + val, callback: function(event) {
		    }},
		    { msg: 'zero2go|api_get_blinking_interval', callback: function(event) {
		      $('#blinking_interval').text(event.data);
		    }}
		  ]);
	  }
	);
};

var set_cut_power_delay = function() {
	inputValue('Power Cut Delay',
	  'Please input the delay between shutdown and power cut:',
	  parseFloat($('#cut_power_delay').text()),
	  '0',
	  '8.0',
	  '0.1',
	  'Seconds',
	  function(val) {
	  	if (val != null && val >= 0 && val <= 8) {
        sharedWS.addCompositeTask([
		    { msg: 'zero2go|api_set_cut_power_delay|' + parseInt(val*10), callback: function(event) {
		    }},
		    { msg: 'zero2go|api_get_cut_power_delay', callback: function(event) {
	       $('#cut_power_delay').text(event.data);
	      }}
		  ]);
	    } else {
	      msgBox('Power Cut Delay', 'The input value is invalid. It should be a value between 0 and 8.');	
	    }
	  }
	);
};

var set_low_voltage = function() {
	var curVal = parseFloat($('#low_voltage').text());
	if (Number.isNaN(curVal)) {
	  curVal = 0;	
	}
  inputValue('Low Voltage Threshold',
	  'Please input the low voltage threshold (0=disabled):',
	  curVal,
	  '0',
	  '25.0',
	  '0.1',
	  'V',
	  function(val) {
	  	if (val != null && val >= 0 && val <= 25) {
        sharedWS.addCompositeTask([
		    { msg: 'zero2go|api_set_low_voltage|' + parseInt(val*10), callback: function(event) {
		    }},
		    { msg: 'zero2go|api_get_low_voltage', callback: function(event) {
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
		    { msg: 'zero2go|api_set_recovery_voltage|' + parseInt(val*10), callback: function(event) {
		    }},
		    { msg: 'zero2go|api_get_recovery_voltage', callback: function(event) {
	       $('#recovery_voltage').text(event.data);
	      }}
		  ]);
	    } else {
	      msgBox('Recovery Voltage Threshold', 'The input value is invalid. It should be a value between 0 and 25.');	
	    }
	  }
	);
};

var set_bulk_alwayson = function() {
	chooseValue('Step-Down Engine Always-On', 
	  'Keep the step-down engine always-on (for faster switching)?',
	  [0, 1],
	  ['No', 'Yes'],
	  $('#bulk_alwayson').text() == 'Yes' ? 1 : 0,
	  function(val) {
	  	sharedWS.addCompositeTask([
		    { msg: 'zero2go|api_set_bulk_alwayson|' + val, callback: function(event) {
		    }},
		    { msg: 'zero2go|api_get_bulk_alwayson', callback: function(event) {
		      $('#bulk_alwayson').text(event.data);
		    }}
		  ]);
	  }
	);
};
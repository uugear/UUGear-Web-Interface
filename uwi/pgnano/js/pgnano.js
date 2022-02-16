var curTab = 'rtc';

var missingPiGearNano = function() {
  var dlg = $('#missingMega4');
  if (dlg.length == 0 || !dlg.dialog('isOpen')) {
    dlg.remove();
    dlg = $("<div id='missingPiGearNano' title='PiGear Nano not found'><p>PiGear Nano has I2C address 0x18, 0x20 and 0x51 on I2C bus-1.</p><p>However one or more of these addresses are missing.</p></div>");
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
    dlg = $("<div id='MissingSoftware' title='PiGear Nano software missing'><p>PiGear Nano's software should be installed beforehand.</p><p>Usually it is installed to the \"/home/pi/pgnano\" directory. If it was installed to a different location, please configure accordingly in the \"uwi.conf\" file.</p></div>");
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

var refresh = function() {
  sharedWS.addCompositeTask([
    { msg: 'pgnano|api_is_red_led_on', callback: function(event) {
      var redLed = $('.led.red');
      var yellowLed = $('.led.yellow');
      if (event.data == 'yes') {
        redLed.addClass('on');
        redLed.attr('title', 'Click to turn off red LED');
        yellowLed.removeClass('on');
        yellowLed.attr('title', 'Click to turn on yellow LED');
      } else {
        redLed.removeClass('on');
        redLed.attr('title', 'Click to turn on red LED');
        yellowLed.addClass('on');
        yellowLed.attr('title', 'Click to turn off yellow LED');
      }
      $('.led.green').addClass('on');
    }},
    { msg: 'pgnano|api_is_buzzer_on', callback: function(event) {
      var buzzer = $('.buzzer');
      if (event.data == 'yes') {
        buzzer.addClass('on');
        buzzer.attr('src', 'img/buzzer_on.png');
        buzzer.attr('title', 'Click to turn off buzzer');
      } else {
        buzzer.removeClass('on');
        buzzer.attr('src', 'img/buzzer.png');
        buzzer.attr('title', 'Click to turn on buzzer');
      }
    }}
  ], true);
  
  refresh_tab_content();
};

var refresh_tab_content = function() {
  if (curTab == 'rtc') {
    refresh_rtc();
  } else if (curTab == 'do') {
    refresh_do(1);
    refresh_do(2);
    refresh_do(3);
    refresh_do(4);
  } else if (curTab == 'dio') {
    refresh_dio();
  } else if (curTab == 'di') {
    refresh_di(1);
    refresh_di(2);
    refresh_di(3);
    refresh_di(4); 
  } else if (curTab == 'adc') {
    refresh_adc();
  }
};

var refresh_rtc = function() {
  sharedWS.addCompositeTask([
  { msg: 'pgnano|api_get_sys_time', callback: function(event) {
    $('#systime').text('SYS Time: ' + event.data);
  }},
  { msg: 'pgnano|api_get_rtc_time', callback: function(event) {
    $('#rtctime').text('RTC Time: ' + event.data);
  }},
  { msg: 'pgnano|api_get_alarm_time', callback: function(event) {
    if (event.data == 'disabled') {
      $('#alarm_details').css('display', 'none');
      sharedWS.addTask('pgnano|api_is_watchdog_on', function(event) {
        if (event.data == 'yes') {
          //$('#watchdog').click();
          $('#watchdog').prop('checked',true).checkboxradio('refresh');
        } else {
          //$('#none').click();
          $('#none').prop('checked',true).checkboxradio('refresh');
        }
      });
    } else {
      $('#alarm_time').text(event.data);
      //$('#alarm').click();
      $('#alarm').prop('checked',true).checkboxradio('refresh');
    }
  }}
  ], true);
};

var sys_to_rtc = function() {
  sharedWS.addTask('pgnano|api_sys_to_rtc', function(event) {
    refresh_rtc();
  });
};

var rtc_to_sys = function() {
  sharedWS.addTask('pgnano|api_rtc_to_sys', function(event) {
    refresh_rtc();
  });
};

var network_sync = function() {
  sharedWS.addTask('pgnano|api_network_sync', function(event) {
    refresh_rtc();
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

var save_alarm = function(dt) {
  if (dt.length > 0) {
    dt = dt.split(' ');
    day = dt[0].split('-')[2];
    t = dt[1].split(':');
    sharedWS.addTask('pgnano|api_set_alarm_time|' + day + '|' + t[0] + '|' + t[1] + '|' + t[2], function(event) {
      refresh_rtc();
    });
  } else {
    sharedWS.addTask('pgnano|api_clear_alarm_time', function(event) {
      refresh_rtc();
    });
  }
};

var set_alarm = function() {
  var alarm=$.trim($('#alarm_time').text());
  if (alarm == '????-??-?? ??:??:??' || alarm.length != 19) {
    alarm = '';
  }
  editDateTime("Change Alarm Time:", alarm, save_alarm);
};

var turn_on_watchdog = function() {
  sharedWS.addTask('pgnano|api_turn_on_watchdog', function(event) {
    refresh_rtc();
  });
};

var turn_off_watchdog = function() {
  sharedWS.addTask('pgnano|api_turn_off_watchdog', function(event) {});
};

var refresh_do = function(index) {
  sharedWS.addTask('pgnano|api_get_do|' + index, function(event) {
    $('#do' + index).text(event.data);
  });
};

var toggle_do = function(index) {
  var dout = $('#do' + index);
  dout.text(dout.text() == '1' ? '0' : '1');
  sharedWS.addTask('pgnano|api_toggle_do|' + index, function(event) {
    switch (index) {
      case 1: refresh_do(1); break;
      case 2: refresh_do(2); break;
      case 3: refresh_do(3); break;
      case 4: refresh_do(4); break;
    }
  });
};

var refresh_di = function(index) {
  sharedWS.addTask('pgnano|api_get_di|' + index, function(event) {
    $('#di' + index).text(event.data);
  });
};

var refresh_dio = function() {
  sharedWS.addCompositeTask([
  { msg: 'pgnano|api_get_dio_modes', callback: function(event) {
    $('#dio-modes').val(event.data).selectmenu('refresh');
    if (event.data == "ININININ") {
      $('#dio1,#dio2,#dio3,#dio4').removeClass('clickable').removeAttr('title');
    } else if (event.data == "ININOUTOUT") {
      $('#dio1,#dio2').removeClass('clickable').removeAttr('title');;
      $('#dio3,#dio4').addClass('clickable').attr('title', 'Click to change value');
    } else if (event.data == "OUTOUTININ") {
      $('#dio1,#dio2').addClass('clickable').attr('title', 'Click to change value');
      $('#dio3,#dio4').removeClass('clickable').removeAttr('title');;
    } else if (event.data == "OUTOUTOUTOUT") {
      $('#dio1,#dio2,#dio3,#dio4').addClass('clickable').attr('title', 'Click to change value');
    }
  }},
  { msg: 'pgnano|api_get_dio_value|1', callback: function(event) {
    $('#dio1').text(event.data);
  }},
  { msg: 'pgnano|api_get_dio_value|2', callback: function(event) {
    $('#dio2').text(event.data);
  }},
  { msg: 'pgnano|api_get_dio_value|3', callback: function(event) {
    $('#dio3').text(event.data);
  }},
  { msg: 'pgnano|api_get_dio_value|4', callback: function(event) {
    $('#dio4').text(event.data);
  }}
  ], true);
};

var set_dio_modes = function(modes) {
  sharedWS.addTask('pgnano|api_set_dio_modes|' + modes, function(event) {
    refresh_dio();
  });
};

var toggle_dio = function(index) {
  var dio = $('#dio' + index);
  if (dio.hasClass('clickable')) {
    dio.text(dio.text() == '1' ? '0' : '1');
    sharedWS.addTask('pgnano|api_toggle_dio|' + index, function(event) {
      refresh_dio();
    });    
  }
};

var refresh_adc = function() {
  /*
  sharedWS.addCompositeTask([
  { msg: 'pgnano|api_get_adc_sps', callback: function(event) {
    $('#sps').val(event.data).selectmenu('refresh');
  }},
  { msg: 'pgnano|api_get_adc_pga', callback: function(event) {
    $('#pga').val(event.data).selectmenu('refresh');
  }}, 
  { msg: 'pgnano|api_get_adc_raw|1', callback: function(event) {
    $('#adc_c1').text(event.data);
  }},
  { msg: 'pgnano|api_get_adc_volt|1', callback: function(event) {
    $('#adc_v1').text(event.data);
  }},
  { msg: 'pgnano|api_get_adc_raw|2', callback: function(event) {
    $('#adc_c2').text(event.data);
  }},
  { msg: 'pgnano|api_get_adc_volt|2', callback: function(event) {
    $('#adc_v2').text(event.data);
  }},
  { msg: 'pgnano|api_get_adc_raw|3', callback: function(event) {
    $('#adc_c3').text(event.data);
  }},
  { msg: 'pgnano|api_get_adc_volt|3', callback: function(event) {
    $('#adc_v3').text(event.data);
  }},
  { msg: 'pgnano|api_get_adc_raw|4', callback: function(event) {
    $('#adc_c4').text(event.data);
  }},
  { msg: 'pgnano|api_get_adc_volt|4', callback: function(event) {
    $('#adc_v4').text(event.data);
  }}
  ], true);*/
  
  sharedWS.addTask('pgnano|api_get_adc_all_info', function(event) {
    var info = JSON.parse(event.data);
    $('#sps').val(info.sps).selectmenu('refresh');
    $('#pga').val(info.pga).selectmenu('refresh');
    $('#adc_c1').text(info.raw1);
    $('#adc_c2').text(info.raw2);
    $('#adc_c3').text(info.raw3);
    $('#adc_c4').text(info.raw4);
    $('#adc_v1').text(info.volt1);
    $('#adc_v2').text(info.volt2);
    $('#adc_v3').text(info.volt3);
    $('#adc_v4').text(info.volt4);
  });
};

var set_adc_sps = function(sps) {
  sharedWS.addTask('pgnano|api_set_adc_sps|' + sps, function(event) {
    refresh_adc();
  });
};

var set_adc_pga = function(pga) {
  sharedWS.addTask('pgnano|api_set_adc_pga|' + pga, function(event) {
    refresh_adc();
  });
};
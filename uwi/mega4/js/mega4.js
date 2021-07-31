var missingMega4 = function() {
  var dlg = $('#missingMega4');
  if (dlg.length == 0 || !dlg.dialog('isOpen')) {
    dlg.remove();
    dlg = $("<div id='missingMega4' title='MEGA4 not found'><p>MEAG4 has USB device ID \"2109:0817\". However this ID is not listed when running \"lsusb\".</p><p>Please check the physical connection between MEGA4 and Raspberry Pi.</p></div>");
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
    dlg = $("<div id='MissingSoftware' title='MEGA4 software missing'><p>MEGA4's software should be installed beforehand.</p><p>Usually it is installed to the \"/home/pi/mega4\" directory. If it was installed to a different location, please configure accordingly in the \"uwi.conf\" file.</p></div>");
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
  sharedWS.addTask('mega4|api_get_devices_info', function(event) {
    if (event.data != '') {
      if (/[^-,\. \d]/.test(event.data)) {
        setTimeout(refresh, 100);
        return;
      }
      var devices = event.data.split(' ');
      var matched = ($('.device').length == devices.length);
      if (matched) {
        for (let i = devices.length - 1; i >= 0; i --) {
          var device = devices[i].split(',');
          if ($('#' + device[0]).length == 0) {
            matched = false;
            break;
          } else {
            updateDevice(device);  
          }
        }
      }
      if (!matched) {
        $('.device').remove();
        for (let i = devices.length - 1; i >= 0; i --) {
          var device = devices[i].split(',');
          loadDevice(device);
        }
        $('.upstream').each(function() {
          if (event.data.indexOf(this.innerText + ',') === -1) {
            this.innerText = 'to RPi';
          } else {
            this.innerText = 'to ' + this.innerText;
          }
        });
      }
      for (let i = 0; i < devices.length; i ++) {
        var device = devices[i].split(',');
        var p = device[0].lastIndexOf('.');
        if (p !== -1) {
          var usDev = device[0].slice(0, p);
          var usPort = device[0].slice(p + 1);
          $('#' + usDev.replaceAll('.', '\\.')).find('.k' + usPort).addClass('switch_disabled');
        }
      }
    }
  });
};


var loadDevice = function(device) {
  var dev = $('<div id="' + device[0] + '" class="device"></div>').appendTo('.section');
  var board = $('<div class="board"><img src="img/board.jpg" /></div>').appendTo(dev);
  var dev_name = $('<div class="dev_name"><div>Hub:</div><span>' + device[0] + '</span></div>').appendTo(dev);  
  var d6 = $('<div class="d6 led red"></div>').appendTo(dev);
  var d11 = $('<div class="d11 led white"></div>').appendTo(dev);
  var d1 = $('<div class="d1 led blue"></div>').appendTo(dev);
  var d12 = $('<div class="d12 led white"></div>').appendTo(dev);
  var d2 = $('<div class="d2 led blue"></div>').appendTo(dev);
  var d13 = $('<div class="d13 led white"></div>').appendTo(dev);
  var d3 = $('<div class="d3 led blue"></div>').appendTo(dev);
  var d14 = $('<div class="d14 led white"></div>').appendTo(dev);
  var d4 = $('<div class="d4 led blue"></div>').appendTo(dev);
  var k1 = $('<div class="k1 switch"></div>').appendTo(dev);
  var k2 = $('<div class="k2 switch"></div>').appendTo(dev);
  var k3 = $('<div class="k3 switch"></div>').appendTo(dev);
  var k4 = $('<div class="k4 switch"></div>').appendTo(dev);
  var parent_dev = device[0].slice(0, device[0].lastIndexOf('.'));
  var us = $('<div class="upstream">' + parent_dev + '</div>').appendTo(dev);
  
  dev_name.textfill({
    maxFontPixels: 21
  });  
  
  k1.click(function() {
    if (!k1.hasClass('switch_disabled')) {
      if (k1.hasClass('switch_off')) {
        k1.removeClass('switch_off');
        turnOnPorts(device[0], 1);
      } else {
        k1.addClass('switch_off');
        turnOffPorts(device[0], 1);
      }
    }
  });
  k2.click(function() {
    if (!k2.hasClass('switch_disabled')) {
      if (k2.hasClass('switch_off')) {
        k2.removeClass('switch_off');
        turnOnPorts(device[0], 2);
      } else {
        k2.addClass('switch_off');
        turnOffPorts(device[0], 2);
      }
    }
  });
  k3.click(function() {
    if (!k3.hasClass('switch_disabled')) {
      if (k3.hasClass('switch_off')) {
        k3.removeClass('switch_off');
        turnOnPorts(device[0], 3);
      } else {
        k3.addClass('switch_off');
        turnOffPorts(device[0], 3);
      }
    }
  });
  k4.click(function() {
    if (!k4.hasClass('switch_disabled')) {
      if (k4.hasClass('switch_off')) {
        k4.removeClass('switch_off');
        turnOnPorts(device[0], 4);
      } else {
        k4.addClass('switch_off');
        turnOffPorts(device[0], 4);
      }
    }
  });
  
  updateStates(device, d11, d1, k1, d12, d2, k2, d13, d3, k3, d14, d4, k4);
};


var updateStates = function(device, d11, d1, k1, d12, d2, k2, d13, d3, k3, d14, d4, k4) {
  k1.removeClass('switch_disabled');
  k2.removeClass('switch_disabled');
  k3.removeClass('switch_disabled');
  k4.removeClass('switch_disabled');
  if (device[1] == 0) {
    d11.addClass('led_off');
    d1.addClass('led_off');
    k1.addClass('switch_off');
  } else {
    d11.removeClass('led_off');
    k1.removeClass('switch_off');
    if (device[1] == 2) {
      d1.removeClass('led_off');
    } else {
      d1.addClass('led_off');
    }
  }
  if (device[2] == 0) {
    d12.addClass('led_off');
    d2.addClass('led_off');
    k2.addClass('switch_off');
  } else {
    d12.removeClass('led_off');
    k2.removeClass('switch_off');
    if (device[2] == 2) {
      d2.removeClass('led_off');
    } else {
      d2.addClass('led_off');
    }
  }
  if (device[3] == 0) {
    d13.addClass('led_off');
    d3.addClass('led_off');
    k3.addClass('switch_off');
  } else {
    d13.removeClass('led_off');
    k3.removeClass('switch_off');
    if (device[3] == 2) {
      d3.removeClass('led_off');
    } else {
      d3.addClass('led_off');
    }
  }
  if (device[4] == 0) {
    d14.addClass('led_off');
    d4.addClass('led_off');
    k4.addClass('switch_off');
  } else {
    d14.removeClass('led_off');
    k4.removeClass('switch_off');
    if (device[4] == 2) {
      d4.removeClass('led_off');
    } else {
      d4.addClass('led_off');
    }
  }
};


var updateDevice = function(device) {
  var dev = $('#' + device[0]);
  var board = dev.find('.board');
  var dev_name = dev.find('.dev_name');;
  var d6 = dev.find('.d6');
  var d11 = dev.find('.d11');
  var d1 = dev.find('.d1');
  var d12 = dev.find('.d12');
  var d2 = dev.find('.d2');
  var d13 = dev.find('.d13');
  var d3 = dev.find('.d3');
  var d14 = dev.find('.d14');
  var d4 = dev.find('.d4');
  var k1 = dev.find('.k1');
  var k2 = dev.find('.k2');
  var k3 = dev.find('.k3');
  var k4 = dev.find('.k4');
  updateStates(device, d11, d1, k1, d12, d2, k2, d13, d3, k3, d14, d4, k4);
  var conn = (device[0].indexOf('.') === -1) ? 'to RPi' : 'to ' + device[0].slice(0, device[0].lastIndexOf('.'));
  dev.find('.upstream').text(conn);
};


var turnOnPorts = function(dev, ports) {
  sharedWS.addTask('mega4|api_turn_on_ports|' + dev + '|' + ports, function(event) {
    refresh();
  });
};


var turnOffPorts = function(dev, ports) {
  $('.shade').css('display', 'block');
  sharedWS.addTask('mega4|api_turn_off_ports|' + dev + '|' + ports, function(event) {  
    refresh();
     $('.shade').css('display', 'none');
  }, false, true);
};
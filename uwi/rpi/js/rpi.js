var modeClassMap = {
	'IN'   : 'input',
	'OUT'  : 'output',
	'ALT0' : 'alt0'	
};

var refreshGPIO = function() {
	sharedWS.addTask('rpi|api_readall', function(event) {
		if (!event.data.startsWith('Error')) {
			$('.gpio_mode').removeClass('gpio_mode').removeClass(['input', 'output', 'alt0']).text('');
			$('.gpio_value').removeClass('gpio_value').removeClass(['input', 'output', 'alt0']).text('');
			
			var pins = event.data.split('+');
			$("#gpioTable tr").each(function(row, tr) {
				var pinL = pins[row * 2].split(',');
				var modeL = pinL[0].trim();
				var valueL = pinL[1].trim();
				var pinR = pins[row * 2 + 1].split(',');
				var modeR = pinR[0].trim();
				var valueR = pinR[1].trim();
				$(tr).find('td').each (function(col, td) {
					var cell = $(td);
					switch(col) {
						case 1:
							cell.text(valueL);
							cell.addClass('gpio_value');
							cell.addClass(modeClassMap[modeL]);
							break;
						case 2:
							cell.text(modeL);
							if (modeL != '') {
								cell.addClass('gpio_mode');
								cell.addClass(modeClassMap[modeL]);
							}
							break;
						case 7:
							cell.text(modeR);
							if (modeR != '') {
								cell.addClass('gpio_mode');
								cell.addClass(modeClassMap[modeR]);
							}
							break;
						case 8:
							cell.text(valueR);
							cell.addClass('gpio_value');
							cell.addClass(modeClassMap[modeR]);
							break;
					}
				});
			});
		}
	}, true);
};

var setupValueButtons = function() {
	$('.gpio_value').click(function() {
		var td = $(this);
		if (td.hasClass('output')) {
			var newVal = (td.text() == '1' ? '0' : '1');
			var myIndex = td.index();
			var physPin = parseInt(td.parent().children().eq(myIndex == 1 ? 4 : 5).text());
			sharedWS.addTask('rpi|api_write_pin|' + physPin + '|' + newVal, function(event) {
				td.text(event.data);
			});
		}
	});
};

var pinsWithAlt0 = [3, 5, 8, 10, 27, 28];

var setupModeButtons = function() {
	$('.gpio_mode').click(function() {
		var td = $(this);
		var myIndex = td.index();
		var physPin = parseInt(td.parent().children().eq(myIndex == 2 ? 4 : 5).text());
		var nextMode = 'in';
		if (td.hasClass('input')) {
			nextMode = 'out';
		} else if (td.hasClass('output')) {
			nextMode = pinsWithAlt0.includes(physPin) ? 'alt0' : 'in';
		} else if (td.hasClass('alt0')) {
			nextMode = 'in';
		}
		sharedWS.addTask('rpi|api_set_mode|' + physPin + '|' + nextMode, function(event) {
			refreshGPIO();
		});
	});
};
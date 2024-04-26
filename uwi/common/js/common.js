var version = '1.23';

var log = function(msg) {
  // print log to console only when debug>0
	if (debug > 0) {
		console.log(msg);
	}
};

var footer = function() {
	var table = $("<table class='footer'></table>").appendTo($('.content'));
	var tr = $("<tr></tr>").appendTo(table);
	var td = $("<td style='width:33%;text-align:left;'></td>").appendTo(tr);
	if (window.location.pathname != '/') {
		$("<a class='homebutton' href='/' target='_self' title='Back to homepage'>&#10094;&#10094;&#10094;</a>").appendTo(td);
	}
	$("<td style='text-align:center;'>UUGear Web Interface V" + version + 
	  "</td><td style='width:33%;text-align:right;'>&copy; Copyright " + (new Date()).getFullYear() + 
	  " <a href='http://www.uugear.com/' target='_blank'>Dun Cat B.V.</a></td>").appendTo(tr);
};

var msgBox = function(title, msg) {
  var dlg = $('#msgBox');
  if (dlg.length == 0 || !dlg.dialog('isOpen')) {
    dlg.remove();
    dlg = $("<div id='msgBox' title='" + title + "'><p>" + msg + "</p></div>").appendTo('body');
    dlg.dialog({
      resizable: false,
      height: "auto",
      width: "auto",
      modal: true
    });
  }
};

var chooseValue = function(title, msg, values, labels, selIndex, callback) {
  var dlg = $('#chooseValue');
  if (dlg.length == 0 || !dlg.dialog('isOpen')) {
    dlg.remove();
    dlg = $("<div id='chooseValue' title='" + title + "'><p>" + msg + "</p></div>").appendTo('body');
    var list = $("<select></select>").appendTo(dlg);
    for (i = 0; i < values.length; i ++) {
      $("<option value='" + values[i] + "'" + (selIndex == i ? " selected='selected'" : "") + ">" + labels[i] + "</option>").appendTo(list);	
    }
    var selVal = values[selIndex];
    dlg.dialog({
      resizable: false,
      height: "auto",
      width: "auto",
      modal: true,
      open: function() {
      	list.selectmenu({
		      change: function( event, data ) {
		        selVal = data.item.value;
		      }
		    });
      },
      buttons: {
        OK: function() {
          $(this).dialog("close");
          callback(selVal);
        },
        Cancel: function() {
          $(this).dialog("close");
        }
      }
   });
  }
};

var inputValue = function(title, msg, curVal, minVal, maxVal, step, unit, callback) {
 var dlg = $('#inputValue');
  if (dlg.length == 0 || !dlg.dialog('isOpen')) {
    dlg.remove();
    dlg = $("<div id='inputValue' title='" + title + "'><p>" + msg + "</p></div>").appendTo('body');
    var spinner = $("<input value='" + curVal + "'>").appendTo(dlg);
    if (unit) {
      $("<span style='margin-left:5px'>" + unit + "</span>").appendTo(dlg);	
    }
    dlg.dialog({
      resizable: false,
      height: "auto",
      width: "auto",
      modal: true,
      open: function() {
      	spinner.spinner({
      		min: minVal,
      		max: maxVal,
      		step: step,
          numberFormat: "n",
      	  change: function( event, ui ) {}	
      	});
      },
      buttons: {
        OK: function() {
          $(this).dialog("close");
          callback(spinner.spinner("value"));
        },
        Cancel: function() {
          $(this).dialog("close");
        }
      }
   });
  }
};

var SharedWebSocket = function() {
	this.taskQueue = [];
	this.connected = false;
	this.runningTask = false;
	this.resp_timeout = false;
	this.ws = new WebSocket(web_socket_url);
	this.init();
};

SharedWebSocket.prototype = {

	reconnect: function() {
		// retry later if socket is not ready yet
		if (this.ws && this.ws.readyState == 0) {
			setTimeout(function(){
				self.reconnect();
			}, 300);
			return false;	
		}
		log('Reconnecting web socket...');
		if (this.ws) {
			this.ws.close();
		}
		this.ws = new WebSocket(web_socket_url);
		this.init();
	},

	addTask: function(msg, callback, canMerge, noTimeout) {
		if (canMerge) {
			if (this.runningTask && this.runningTask.msg == msg) {
				log('Merged to current task.');
				return;	
			}
			for (i = 0; i < this.taskQueue.length; i ++) {
				if (this.taskQueue[i].msg == msg) {
					log('Merged to queued task #' + i);
					return;	
				}	
			}
		}
		log('Add: ' + msg);
		this.taskQueue.push({
			'msg' : msg,
			'callback' : callback,
			'noTimeout' : noTimeout
		});
		if (!this.runningTask) {
			var self = this;
			setTimeout(function(){
				self.runTask();
			}, 0);
		}
	},
	
	addCompositeTask: function(tasks, canMerge) { // tasks is an array of objects { msg, callback } 
		var msg = '';
		var callback = [];
		for (index = 0; index < tasks.length; index ++) {
			// merge messages with #
			msg += (index == 0 ? tasks[index].msg : "#" + tasks[index].msg);
			callback.push(tasks[index].callback);
		}
		this.addTask(msg, callback, canMerge);
	},
	
	runTask: function() {
		var self = this;
		if (!this.runningTask && this.taskQueue.length > 0) {
			// retry later if socket is not ready yet
			if (this.ws.readyState == 0) {
				setTimeout(function(){
					self.runTask();
				}, 300);
				return false;	
			}
			// reconnect if websocket is lost
			if (this.ws.readyState != 1) {
				this.reconnect();
				return false;
			}
			log('Run: ' + this.taskQueue[0].msg);
			this.runningTask = this.taskQueue.shift();
			this.ws.send(this.runningTask.msg);
			this.resp_timeout = setTimeout(function() {
				// drop the current task if timeout
				log('Timeout: ' + self.runningTask.msg);
				self.runningTask = false;
				// run the the next task
				self.runTask();
			}, this.runningTask.noTimeout ? 2147483647 : response_timeout);
			return true;
		}
	},
	
	init: function() {
		var self = this;
		this.ws.onopen = function() {
			self.connected = true;
			$('#ConnectionError').dialog('close');
			setTimeout(function(){
				self.runTask();
			}, 0);
		};
		this.ws.onerror = function(event) {
			self.connected = false;
			// inform user about the error
			var dlg = $('#ConnectionError');
			if (dlg.length == 0 || !dlg.dialog('isOpen')) {
				dlg.remove();
				dlg = $("<div id='ConnectionError' title='Connection Error'><p>Can not connect to the device ...</p><p>Please first check the configurations in \"uwi.conf\" file.</p></div>");
				dlg.dialog({
				autoOpen: true,
				closeOnEscape: false,
			  height: 140,
			  width: 420,
			  modal: true,
			  buttons: {},
			  show: 'fade',
			  hide: 'fade',
			  open: function(event, ui) {
	      	dlg.parent().find(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
	    	}
				});
			}
			setTimeout(function() {
				self.reconnect();
			}, reconnect_timeout);
		};
		this.ws.onmessage = function(event) {
			if (self.runningTask) {
				if (self.resp_timeout) {
					clearTimeout(self.resp_timeout);
					self.resp_timeout = false;
				}
				log('Result: ' + event.data);
				if (Array.isArray(self.runningTask.callback)) {
					// composite task
					var d = event.data.split('\\n');
					for (index = 0; index < self.runningTask.callback.length; index ++) {
						var ev = Object.assign({}, event);
						ev.data = d[index];
						if (self.runningTask.callback[index]) {
						  self.runningTask.callback[index](ev);	
					  }
					}
				} else {
					// simple task
					if (self.runningTask.callback) {
					  self.runningTask.callback(event);
				  }
				}
				self.runningTask = false;
			}
			setTimeout(function(){
				self.runTask();
			}, 0);
		};
	}
};

var sharedWS = new SharedWebSocket();
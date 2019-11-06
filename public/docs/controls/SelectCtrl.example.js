/*
    allowing user to change value on pin 13
*/
	var using = ["SelectCtrl"];
	
	var deviceId = '5dc29ce39af1a042287a2897',
	    pin1, 
	    ctrl;

    function initView(pinObject) {
    	
    	var options = {   '0' : 'Off',
    	                '200' : 'low power',
    	                '512' : 'half power',
    	                '700' : 'more power',
    	               '1023' : 'full power'
                      };
    	
    	ctrl = new SelectCtrl(70, 20, pinObject, options, 1023);
    	ctrl.setValue(pinObject.value);
    	
    	// Tell the pinObject to call this function when something connected to it is clicked
    	pinObject.registerClicks(function(data) {
    		ctrl.active(false);
    		var pin = data.pinObject;
    		var sendObj = {};
    		sendObj[pin.getNumber()] = ctrl.getValue();
    		var url = getServer()+'/devices/pins/'+ pin.savedDeviceID;
    		var posting = $.post( url, sendObj);
    		posting.done(function(data) {
			var pinInfo = data.pins.filter(info => info.pin === 13);
			ctrl.setValue(pinInfo[0].val);
    		}).fail(function(data) {
    			showModalErrorText('Device not found', 'Unable to get data from device "'+pin.savedDeviceID+'".');
    		});
    	});
    }
    
	$(function () {
		//Get pin value from device
    	var url = getServer()+'/devices/pins/'+ deviceId;
    	$.get(url).done(function(data) {
    		var pinInfo = data.pins.filter(info => info.pin === 13);
    		//Create the pin object which will be used by the button object
    		var pin13 = new Pin(pinInfo[0].pin, pinInfo[0].val, deviceId, 1, deviceId);
    		//Setup the button with the current pin value
    		initView(pin13);
    	}).fail(function(data) {
    		showModalErrorText('Device not found', 'Unable to get data from device "'+deviceId+'".');
    	});
	
	});
	
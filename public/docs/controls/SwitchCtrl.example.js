var using = ["SwitchCtrl"];
var button;

function initView(pinObject) {
	//Create the button object and position it x=10 and y=20
	button = new SwitchCtrl(10, 20, pinObject, 1);
	
	// Tell the pinObject to call this function when something connected to it is clicked
	// In this case, the button object.
	pinObject.registerClicks(function(data) {
		button.active(false);
		var pin = data.pinObject;
		var sendObj = {};
		sendObj[pin.getNumber()] = button.pinValue;
		var url = getServer()+'/devices/pins/'+ pin.savedDeviceID;
		var posting = $.post( url, sendObj);
		posting.done(function(data) {
			var pinInfo = data.pins.filter(info => info.pin === 13);
			button.setValue(pinInfo[0].val);
		}).fail(function(data) {
			showModalErrorText('Device not found', 'Unable to get data from device "'+pin.savedDeviceID+'".');
		});
	});
}

$(function () {
	var deviceId = '5db9d65d3c3aed0b60b932bc';
	
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

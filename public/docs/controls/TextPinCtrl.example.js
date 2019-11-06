
	var using = ["TextPinCtrl"],
	    deviceId = '5dc2a9c0fd618f1f1466d0e5',
	    ctrl;
	
function initView(pinObject) {
	// Create the button object and position it x=10 and y=20
	ctrl = new TextPinCtrl(10, 20, pinObject, 1);
	ctrl.scale(10);
	ctrl.rotate(33);
}

$(function () {
	var url = getServer()+'/devices/pins/'+ deviceId;
	$.get(url).done(function(data) {
		var pinInfo = data.pins.filter(info => info.pin === 13);
		
		// Create the pin object which will be used by the ctrl
		var pin13 = new Pin(pinInfo[0].pin, pinInfo[0].val, deviceId, 1, deviceId);
		
		// Setup the text control with the current pin value
		initView(pin13);
	}).fail(function(data) {
		showModalErrorText('Device not found', 'Unable to get data from device "'+deviceId+'".');
	});
});
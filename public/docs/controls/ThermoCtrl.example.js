var using = ["ThermoCtrl"];

/*	
	if we call the pin value on the device devicePinValue.
	and we want to be able to set that value directly with the setValue function
	then you can use the setPinValueRatio function to make the setValue function 
	always map the  devicePinValue to the meter value.

	Example: If the devicePinValue is 1023 and it reprisents the 30° on the meter
	then you can set the correct value on the meter by calling:
			meter.setPinValueRatio(30/1023);
			or more general example:
				var meter = new ThermoPin(0, 0, 1, 0, 30);
				meter.setPinValueRatio(meter.getHigestValue()/1023);
				meter.setValue(1023);  //this will put the control to 30°
*/


var deviceId = '5dc29ce39af1a042287a2897'
var ctrl;

function initView(pinObject) {
	// Create the button object and position it x=10 and y=20
	ctrl = new ThermoCtrl(100, 0, pinObject, 40);
	ctrl.addTicks(4);
	ctrl.scale(1.5);
}

$(function () {
	var url = getServer()+'/devices/pins/'+ deviceId;
	$.get(url).done(function(data) {
		var pinInfo = data.pins.filter(info => info.pin === 13);
		
		// Create the pin object which will be used by the ctrl
		var pin13 = new Pin(pinInfo[0].pin, pinInfo[0].val, deviceId, 1023, deviceId);
		
		// Setup the text control with the current pin value
		initView(pin13);
	}).fail(function(data) {
		showModalErrorText('Device not found', 'Unable to get data from device "'+deviceId+'".');
	});
});
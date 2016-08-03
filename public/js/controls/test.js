var switch1, meter, diode, slider1, pin1;
var timer1;
const TIMEOUT = 1000;
function callback(that){
	console.log("callback:");
	pin1.setValue(that);
}
function onLoad(){
	pin1 = new Pin(1, 999);
	diode = new DiodePin(100,0,pin1, 1023);
	
	meter = new ThermoPin(200, 0, pin1, 30);
	meter.setPinValueRatio(meter.getHigestValue()/1023);
	switch1 = new SwitchPin(300, 0, pin1, 1023);
	slider1 = new SliderPin(400, 0, pin1, 1023);
	
	
	pin1.active(true);
	
	//displays values as they are inactive.
	
	meter.addTicks(4);
	meter.setPinValueRatio(meter.getHigestValue()/1023);
	meter.scale(1);

	switch1.scale(0.5);
	pin1.registerClicks(callback);
}

var switch1, meter, diode, slider1,slider2, pin1;
var timer1;
const TIMEOUT = 1000;
function callback(that){
	console.log("callback:");
	pin1.setValue(that);
}
function onLoad(){
	diode = new DiodePin(100,0,5, 500, 1023);
	meter = new ThermoPin(200, 0, 1, 0, 30);
	meter.setPinValueRatio(meter.getHigestValue()/1023);
	switch1 = new SwitchPin(300, 0, 1, 0, 30);
	slider1 = new SliderPin(400, 0, 6, 710, 1023);
	slider2 = new SliderPin(400, 40, 5, 710, 1023);
	pin1 = new Pin(1, 0);
	pin1.addControl(diode);
	pin1.addControl(meter);
	pin1.addControl(switch1);
	pin1.addControl(slider1);
	pin1.addControl(slider2);
	
	pin1.setValue(444);
	pin1.log();
	pin1.active(false);
	pin1.active(true);
	
	//displays values as they are inactive.
	
	meter.addTicks(4);
	meter.setPinValueRatio(meter.getHigestValue()/1023);
	meter.scale(1);

	switch1.scale(0.5);
	switch1.registerClick(callback);
	slider1.registerClick(callback);
	slider2.registerClick(callback);
	
	switch1.isKnobOn();
	switch1.setValue(0);
	switch1.isKnobOn();
	//timer1 = setTimeout(tim1, TIMEOUT);
}
function tim0(){
	clearTimeout(timer1);
		diode.active(false);


	switch1.setValue(0);
	meter.setValue(300);

	timer1 = setTimeout(tim1, TIMEOUT);

}
function tim1(){
	clearTimeout(timer1);
	diode.setValue(200);
	switch1.active(false);
	meter.active(false);
	meter.setValue(600);
	timer1 = setTimeout(tim2, TIMEOUT);

}
function tim2(){
	clearTimeout(timer1);
	diode.setValue(500);
	switch1.setValue(300);
	meter.active(true);
	meter.setValue(1023);
	timer1 = setTimeout(tim3, TIMEOUT);
}

function tim3(){
	clearTimeout(timer1);
	diode.setValue(1023);
	switch1.active(false);
	meter.setValue(900);
	timer1 = setTimeout(tim0, TIMEOUT);
}



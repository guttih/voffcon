var pin1, pin2,
	switch1, meter1, diode1, slider1, text1,
	switch2, meter2, diode2, slider2, text2;
var timer1;
const TIMEOUT = 1000;
function onClickCAllback(obj){

	var pin = obj.pinObject;
	var value = obj.getPinValue();
	//todo: gray everything and call a function which queries from the server
	// and the result will set the pins value.
	//pin.setValue(value);
	pin.active(false);
	var sendObj = {};
	sendObj[pin.getNumber()] = value;
	var SERVERURL = pin.host;
	var posting = $.post( SERVERURL+'/pins', sendObj);
	posting.done(function( data ) {
		for(var i = 0; i<data.pins.length;i++){
			pins.get(data.pins[i].pin).setValue(data.pins[i].val);			
			
			//if(pins[i].m === 1 ){			/*mode 1 = OUTPUT*/
		} // for
});

}
class Pins {
	constructor(){
		this.pins = [];
	}
	add(number, value, host, higestValue){
		this.pins.push(new Pin(number, value, host, higestValue));
	}
	get(number){
		var pin;
		
		for(var i = 0; i < this.pins.length; i++){
			pin = this.pins[i];
			if(pin.getNumber() == number)
			return pin;
		}
		return null;
	}
	log(){
		console.log(this);
	}
}
var pins;
var controls;
var d ,t,s;

function setupAppPins(){
	var pin, d,s, i=0;
	for(var x = 0; x < pins.pins.length; x++) {
		
		pin = pins.pins[x];
		d = new DiodeCtrl(i,0,pin);
		s = new SliderCtrl(i-32, 75, pin);
		i = i + 25;
		s.rotate(270);
		s.scale(0.7);
		pin.registerClicks(onClickCAllback);
	}

}
function onLoad(){
	controls = [];
	var maxValue = 1024;
	var host = 'http://192.168.1.151:5100';
	pins = new Pins();
	pins.add(16,0, host, maxValue);
	pins.add(5,0, host, maxValue);
	pins.add(4,0, host, maxValue);
	pins.add(0,0, host, maxValue);
	pins.add(2,0, host, maxValue);
	pins.add(14,0, host, maxValue);
	pins.add(12,0, host, maxValue);
	pins.add(13,0, host, maxValue);
	pins.add(15,0, host, maxValue);
	
	var t = new ThermoCtrl(10, 200, pins.get(16));
	var d = new SwitchCtrl(100, 200, pins.get(16));
	t.addTicks(10);
	d.scale(0.4);

	setupAppPins();

}

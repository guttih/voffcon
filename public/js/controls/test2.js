var pin1, pin2,
	switch1, meter1, diode1, slider1, text1,
	switch2, meter2, diode2, slider2, text2;
var timer1;
const TIMEOUT = 1000;

function updateView( pinValues ) {
		for(var i = 0; i<pinValues.length;i++){
			pins.get(pinValues[i].pin).setValue(pinValues[i].val);			
			
			//if(pins[i].m === 1 ){			/*mode 1 = OUTPUT*/
		} // for
}

function onClickCAllback(obj){
	console.log("onClickCAllback");
	var pin = obj.pinObject;
	var value = obj.getPinValue();
	pin.active(false);
	var sendObj = {};
	sendObj[pin.getNumber()] = value;
	var SERVERURL = pin.host;
	var posting = $.post( SERVERURL+'/pins', sendObj);
	posting.done(function(data){
		updateView(data.pins);
	});
}


function fetchPinValues(){
	var posting = $.get( pins.host+'/pins');
	posting.done(function(data){
		updateView(data.pins);
	});
}
class Pins {
	constructor(host, highestValue){
		this.pins = [];
		this.host = host;
		this.highestValue = highestValue;
	}
	add(number, value, higestValue){
		this.pins.push(new Pin(number, value, this.host, higestValue));
	}
	/*will delete all existing pins and fetch all pins and their values from the server and add them*/
	fetchAllPins(callback){
		this.pins = [];
		var posting = $.get( pins.host+'/pins');
		var that = this;
		posting.done(function(data){
			that.addPins(data.pins, callback);
		});
		
	}
	addPins(serverPins, callback){
		for(var i = 0; i<serverPins.length;i++){
			this.add(serverPins[i].pin, serverPins[i].val, this.highestValue);
		} 
		callback();
	}
	isFirefox(){return (navigator.userAgent.toLowerCase().indexOf('firefox') > -1);}
	get(number){
		var pin;
		
		for(var i = 0; i < this.pins.length; i++){
			pin = this.pins[i];
			if(pin.getNumber() == number){
				return pin;
			}
		}
		return null;
	}

	active(bActivate){
		var pin;
		for(var i = 0; i < this.pins.length; i++){
			pin = this.pins[i];
			pin.active(bActivate);
		}
	}

	log(){
		console.log(this);
	}
}
var pins;
var controls;
var d ,t,s;

var setupAppPins = function setupAppPins(){
	var pin, d,s, i=0, offset=0;
	if (pins.isFirefox()){
		offset=43;
	}

	for(var x = 0; x < pins.pins.length; x++) {
		
		pin = pins.pins[x];
		d = new DiodeCtrl(i,0,pin);
		s = new SliderCtrl(i-(32+offset), 75, pin);
		i = i + 25;
		s.rotate(270);
		s.scale(0.7);
		pin.registerClicks(onClickCAllback);
	}
	
}
function onLoad(){
	controls = [];
	var maxValue = 1024;
	pins = new Pins('http://192.168.1.151:5100', 1023);
	/*pins.add(16,0, maxValue);
	pins.add(5,0, maxValue);
	pins.add(4,0, maxValue);
	pins.add(0,0, maxValue);
	pins.add(2,0, maxValue);
	pins.add(14,0, maxValue);
	pins.add(12,0, maxValue);
	pins.add(13,0, maxValue);
	pins.add(15,0, maxValue);*/
	pins.fetchAllPins(setupAppPins);
	
	//pins.active(false);
	/*var t = new ThermoCtrl(300, 250, pins.get(16));
	var d = new SwitchCtrl(400, 200, pins.get(16));
	t.addTicks(10);
	d.scale(0.4);*/

	
	//fetchPinValues();
}

"use strict";
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
	isFirefox(){return (window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1);}
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
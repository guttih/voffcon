"use strict";
class Pin { 
	constructor(number, value, host, higestValue, deviceID) {
		this.controls = [];
		this.number = number;
		this.value = value;
		this.savedDeviceID = host;
		this.higestValue = higestValue;
		this.deviceID = deviceID;
	}
	//adds or attaches a pin control to this pin
	addControl(control){
		this.controls.push(control);
	}
	getNumber(){
		return this.number;
	}
	getValue(){
		return this.value;
	}
	getHigestValue(){
		return this.higestValue;
	}
	getDeviceID(){
		return this.deviceID;
	}
	/*
	This functon will set a new value to this pin and update all connected controls*/
	setValue(value){
		this.value = value;
		
		for(var i = 0; i<this.controls.length;i++){
			this.controls[i].setValue(this.value);
		}
	}
	active(bActive){
		
		for(var i = 0; i<this.controls.length;i++){
			this.controls[i].active(bActive);
		}
	}
	scale(value){
		
		for(var i = 0; i<this.controls.length;i++){
			this.controls[i].scale(value);
		}
	}
	rotate(degrees){
		
		for(var i = 0; i<this.controls.length;i++){
			this.controls[i].rotate(degrees);
		}
	}

	registerClicks(callback){
		for(var i = 0; i<this.controls.length;i++){
			if (this.controls[i].registerClick !== undefined){
				this.controls[i].registerClick(callback);
			}
		}
	}

}

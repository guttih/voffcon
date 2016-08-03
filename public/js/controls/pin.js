"use strict";
class Pin { 
	constructor(number, value) {
		this.controls = [];
		this.number = number;
		this.value = value;
	}
	addControl(control){
		this.controls.push(control);
	}
	log(){
		console.log(this);
	}
	getNumber(){
		return this.number;
	}
	getValue(){
		return this.value;
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
	registerClicks(callback){
		for(var i = 0; i<this.controls.length;i++){
			if (this.controls[i].registerClick !== undefined){
				this.controls[i].registerClick(callback);
			}
		}
	}

}

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

}

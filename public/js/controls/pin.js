/*
        Ardos is a system for controlling devices and appliances from anywhere.
        It consists of two programs.  A “node server” and a “device server”.
        Copyright (C) 2016  Gudjon Holm Sigurdsson

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, version 3 of the License.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program.  If not, see <http://www.gnu.org/licenses/>. 
        
You can contact the author by sending email to gudjonholm@gmail.com or 
by regular post to the address Haseyla 27, 260 Reykjanesbar, Iceland.
*/
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

/*
        VoffCon is a system for controlling devices and appliances from anywhere.
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
var iDeviceClassMakerID = 0;

class Device {
	constructor(savedDeviceID, highestValue){
		
		//iDeviceClassMakerID = iDeviceClassMakerID + 1; 
		this.ID = ++iDeviceClassMakerID;
		this.pins = [];
		this.savedDeviceID = savedDeviceID;
		this.highestValue = highestValue;
	}
	add(number, value, higestValue){
		this.pins.push(new Pin(number, value, this.savedDeviceID, higestValue, this.ID));
	}
	/*will delete all existing pins and fetch all pins and their values from the server and add them*/
	fetchAllPins(callback, errorCallback){
		this.pins = [];
		//var posting = $.get( this.host+'/pins');
		var posting = $.get(getServer()+'/devices/pins/'+this.savedDeviceID);
		var that = this;
		posting.done(function(data){
			that.addPins(data.pins, callback);
		})
		.fail(function(data){
			console.log("fail pins::fetchAllPins");
			if (errorCallback!==undefined){
				errorCallback(data);
			}
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

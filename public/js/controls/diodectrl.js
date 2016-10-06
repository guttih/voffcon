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
/*
	Use this control to display the value of a pin.
	This control draws a image of an diode on the screen and within
	that diode there is a number representing the pin value.
*/
class DiodeCtrl extends PinControl {
	constructor(left, top, pinObject, highestValue){
		var pinNumber = pinObject.getNumber();
		var pinValue  = pinObject.getValue();
		if (highestValue === undefined){
			highestValue = pinObject.getHigestValue();
		}

		super('diode-ctrl', left, top, pinNumber, pinValue, highestValue, pinObject.getDeviceID());

		var ratio = highestValue / pinObject.getHigestValue();
		this.setPinValueRatio(ratio);
		this.setValue(super.getPinValue());
		pinObject.addControl(this);
	}

	getLight(){ return $('#' + super.getId() + '> .light');}
	getLightTop(){ return $('#' + super.getId() + '> .light-top');}
	getLighBottom(){ return $('#' + super.getId() + '> .light-bottom');}
	getText(){ return $('#' + super.getId() + '> .pinvalue');}
	
	scale(value){
		super.scale(this.getLight(), value);
	}
	rotate(degrees){
		super.rotate(this.getLight(), degrees);
	}
	//if bActivate == false then the pin gecomes grayed show that it is inactivated
	active(bActivate){
		
		if (bActivate === true){
			this.setValue(super.getPinValue()/this.pinValueRatio);//this will show the state but todo: we could loose precition
			return;
		}
		//bActivate is false so let's gray everything
		var background = '#cccccc';

		//this.getLight().css({background:background});
		this.getLightTop().css({background:background});
		this.getLighBottom().css({background:background});
	}
	

	setValue(value){
		
		super.setPinValue(value*this.pinValueRatio);
		var background = 'red';
		var opacity = super.getPinValue() /super.getHigestValue();
		if (opacity < 0.05){ opacity = 0.05;	}
		
		this.getLightTop().css({background: background, opacity:opacity});
		this.getLighBottom().css({background: background, opacity:opacity});
		this.getText().text(Math.round((super.getPinValue()*100)/100));
	}
		setPinValueRatio(ratio){
		this.pinValueRatio = ratio;
	}
	

}//class


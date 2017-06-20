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
/*
Use this control to display the value of a pin
The value will be displayed as a text.
*/
class TextCtrl extends PinControl {
	constructor(left, top, pinObject, highestValue){
		var pinNumber = pinObject.getNumber();
		var pinValue  = pinObject.getValue();
		
		super('text-ctrl', left, top, pinNumber, pinValue, highestValue);

		var ratio = 1;
		if(highestValue !== undefined){
			ratio = highestValue/pinObject.getHigestValue();
		}
		this.setPinValueRatio(ratio);
		this.setValue(pinValue);
		pinObject.addControl(this);
	}

	getText(){ return $('#' + super.getId() + '> p');}	
	scale(value){
		super.scale(this.getText(), value);
	}
	rotate(degrees){
		super.rotate(this.getText(), degrees);
	}
	
	//if bActivate == false then the pin gecomes grayed show that it is inactivated
	active(bActivate){
		
		if (bActivate === true){
			this.getText().css({color:'#000000'});
			return;
		}
		this.getText().css({color:'#cccccc'});
	}

	setValue(value){
		super.setPinValue(value*this.pinValueRatio);
		this.getText().css({color:'#000000'});
		var val = Math.round((super.getPinValue()*100)/100);
		this.getText().text(val);
	}
	setPinValueRatio(ratio){
		this.pinValueRatio = ratio;
	}
}//class


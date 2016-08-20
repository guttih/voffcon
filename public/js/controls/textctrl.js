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


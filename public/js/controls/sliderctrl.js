"use strict";
/*
Use this control to change a pins value.
The control will show a slider with a small marker wich the user
can drag or slide to change the pin's value.
*/
class SliderCtrl extends PinControl {
	constructor(left, top, pinObject, highestValue){
		var pinNumber = pinObject.getNumber();
		var pinValue  = pinObject.getValue();
		if (highestValue === undefined){
			highestValue = pinObject.getHigestValue();
		}
		super('slider-ctrl', left, top, pinNumber, pinValue, highestValue, pinObject.getDeviceID());
		this.getSlider().attr('max', highestValue);
		this.setPinValueRatio(1);
		this.setValue(super.getPinValue());
		this.registerClick();
		
		pinObject.addControl(this);
		this.pinObject = pinObject;
	}

	getSlider(){ return $('#' + super.getId()+ ' > input');}
	//if bActivate == false then the pin gecomes grayed show that it is inactivated
	active(bActivate){
		
		if (bActivate === true){
			this.setValue(super.getPinValue());//this will show the state
			return;
		}
		//bActivate is false so let's gray everything
		var background = '#cccccc';

	}
	
	setValue(value){
		super.setPinValue(value*this.pinValueRatio);
		this.getSlider().val(super.getPinValue());
	}
		setPinValueRatio(ratio){
		this.pinValueRatio = ratio;
	}
	onClick(inData){
		var pObj = inData.data.that;
			pObj.setPinValue(pObj.getSlider().val());
		if (inData.data.callback !== undefined){
			inData.data.callback(pObj);
		}
	}

	scale(value){
		super.scale(this.getSlider(), value);
	}
	rotate(degrees){
		//firefox cannot rotated the scaled slider but it can rotate the parent element
		super.rotate($('#' + super.getId()), degrees);
	}
	
	registerClick(callback){
		var obj = {that:this};
		if (callback !== undefined){
			obj['callback'] = callback;
		}
		//todo: slider will not update when set to a new value
		/*this.getSlider().on( "mouseup", obj, this.onClick );*/
		this.getSlider().live( "tap mouseup change touchstart", obj, this.onClick );
	
	}
	

}//class


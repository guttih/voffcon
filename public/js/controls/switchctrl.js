"use strict";
/*
Use this control to turn a pin value off or on.
This control will display a iphone-like switch which
the user can click on to turn the pin on or off. 
*/
class SwitchCtrl extends PinControl {
	constructor(left, top, pinObject, highestValue){
		var pinNumber = pinObject.getNumber();
		var pinValue  = pinObject.getValue();
		if (highestValue === undefined){
			highestValue = pinObject.getHigestValue();
		}
		super('switch-ctrl', left, top, pinNumber, pinValue, highestValue, pinObject.getDeviceID());

		this.setValue(super.getPinValue());
		pinObject.addControl(this);
		this.pinObject = pinObject;
	}

	getKnob(){ return $('#' + super.getId() + '> svg > .knob');}
	getKnobBackground(){ return $('#' + super.getId() + '> svg > .knob-background');}
	
	//if bActivate == false then the pin gecomes grayed show that it is inactivated
	active(bActivate){
		if (bActivate === true){
			this.setValue(super.getPinValue());//this will show the state
			return;
		}
		//bActivate is false so let's gray everything
		var fill = '#bbbbbb',
			Backfill = '#ffdfdf',
			stroke = '#bbbbbb',
			cx = 65;

		this.getKnob().css({	fill:fill,
								stroke: stroke});
		this.getKnob().attr("cx",cx);
		this.getKnobBackground().css({	fill:Backfill});
	}
	
	//change state of the UI.  Move button circle and change it's color
	power(bSwitchOn){
		var fill = '#bbbbbb',
			Backfill = '#ffffff',
			stroke = '#bbbbbb',
			cx = 41;
		if (bSwitchOn === true){
			fill = '#11cc11';
			stroke = '#11cc44';
			Backfill = '#ddffdd';
			cx = 90;
		}

		this.getKnob().css({	fill:fill,	stroke: stroke});
		this.getKnob().attr("cx",cx);
		this.getKnobBackground().css({	fill:Backfill});
	}
	scale(value){
		super.scale($('#' + super.getId() + '> svg'), value);
	}
	rotate(degrees){

		super.rotate($('#' + super.getId() + '> svg'), degrees);
	}

	
	setValue(value){
		super.setPinValue(value);
		if (super.getPinValue() > 0){
			this.power(true);
		}
		else{
			this.power(false);
		}
		
	}
	//register the function to be called when the switchpin ojbect is clicked
	onClick(inData){
		var pSwitch = inData.data.that;
		var val = 0;
		if (pSwitch.getPinValue() === 0){
			val = pSwitch.getHigestValue();
		}
		pSwitch.setValue(val);
		inData.data.callback(pSwitch);
	}
	registerClick(callback){
		var obj = {that:this};
		if (callback !== undefined){
			obj['callback'] = callback;
		}
		this.getKnob().on( "click", obj, this.onClick );
		
	}

}//class

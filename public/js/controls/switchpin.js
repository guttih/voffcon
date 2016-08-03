class SwitchPin extends PinView {
	constructor(left, top, pinObject, highestValue){
		var pinNumber = pinObject.getNumber();
		var pinValue  = pinObject.getValue();
		super('switchpin', left, top, pinNumber, pinValue, highestValue);

		this.setValue(super.getPinValue());
		pinObject.addControl(this);
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

	//scales an jqery element
	scale(scaleValue){
		super.scale(super.getSvg(), scaleValue);
	}
	
	setValue(value){
		console.log("switchpin::setValue value="+value);
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
		inData.data.callback(pSwitch.getPinValue());
	}
	registerClick(callback){
		var that = this;
		this.getKnob().on( "click", {that:that, callback: callback}, this.onClick );
	}

}//class

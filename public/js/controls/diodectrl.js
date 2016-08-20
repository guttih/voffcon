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


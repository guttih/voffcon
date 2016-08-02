class DiodePin extends PinView {
	constructor(left, top, pinNumber, pinValue, highestValue){
		super('diodepin', left, top, pinNumber, pinValue, highestValue);

		this.setPinValueRatio(1);
		this.setValue(super.getPinValue());
	}

	getLight(){ return $('#' + super.getId() + '> .light');}
	getLightTop(){ return $('#' + super.getId() + '> .light-top');}
	getLighBottom(){ return $('#' + super.getId() + '> .light-bottom');}
	getText(){ return $('#' + super.getId() + '> .pinvalue');}
	
	
	//if bActivate == false then the pin gecomes grayed show that it is inactivated
	active(bActivate){
		
		if (bActivate === true){
			this.setValue(super.getPinValue());//this will show the state
			return;
		}
		//bActivate is false so let's gray everything
		var background = '#cccccc';

		//this.getLight().css({background:background});
		this.getLightTop().css({background:background});
		this.getLighBottom().css({background:background});
	}
	
	//scales an jqery element
	scale(scaleValue){
		super.scale(super.getLight(), scaleValue);
	}
	
	setValue(value){
		super.setPinValue(value*this.pinValueRatio);
		var background = 'red';
		var opacity = super.getPinValue() /super.getHigestValue();
		if (opacity < 0.05){ opacity = 0.05;	}
		
		this.getLightTop().css({background: background, opacity:opacity});
		this.getLighBottom().css({background: background, opacity:opacity});
		this.getText().text(super.getPinValue());
	}
		setPinValueRatio(ratio){
		this.pinValueRatio = ratio;
	}
	

}//class


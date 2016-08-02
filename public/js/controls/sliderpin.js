class SliderPin extends PinView {
	constructor(left, top, pinNumber, pinValue, highestValue){
		super('sliderpin', left, top, pinNumber, pinValue, highestValue);

		this.setPinValueRatio(1);
		this.setValue(super.getPinValue());
		this.registerClick();
		this.getSlider().attr('max', highestValue);
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
	
	//scales an jqery element
	scale(scaleValue){
		super.scale(super.getLight(), scaleValue);
	}
	
	setValue(value){
		super.setPinValue(value*this.pinValueRatio);
		console.log("SliderPin setting value:"+super.getPinValue());
		this.getSlider().val(super.getPinValue());
	}
		setPinValueRatio(ratio){
		this.pinValueRatio = ratio;
	}
	onClick(inData){
		var pObj = inData.data.that;
		//pSwitch.setValue(!pSwitch.getPinValue());
		//inData.data.callback(pSwitch.getPinValue());
			pObj.setPinValue(pObj.getSlider().val());
		if (inData.data.callback !== undefined){
			callback(pObj.getPinValue());
		}
	}
	registerClick(callback){
		var that = this;
		var obj = {that:that};
		if (callback !== undefined){
			obj['callback'] = callback;
		}
		//todo: slider will not update when set to a new value
		this.getSlider().on( "mouseup", obj, this.onClick );
	}
	

}//class


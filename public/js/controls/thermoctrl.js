//todo: nú vantar map function hún segir til um hæstu tölu og lægstu
//todo: gera makeScale function sem addar skala á glasið.  makeScale þarf að hafa option hvort þú viljir bara sjá strikin eða hvort eigi að bæta við tölunum. °

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes  and
http://www.2ality.com/2015/02/es6-classes-final.html */

"use strict";
/*	if we call the pin value on the device devicePinValue.
		and we want to be able to set that value directly with the setValue function
		then you can use the setPinValueRatio function to make the setValue function 
		always map the  devicePinValue to the meter value.

		Example: If the devicePinValue is 1023 and it reprisents the 30° on the meter
		then you can set the correct value on the meter by calling:
				meter.setPinValueRatio(30/1023);
				or more general example:
					var meter = new ThermoPin(0, 0, 1, 0, 30);
					meter.setPinValueRatio(meter.getHigestValue()/1023);
					meter.setValue(1023);  //this will put the control to 30°
	*/
class ThermoCtrl extends PinControl {
	constructor(left, top, pinObject, highestValue){
		var pinNumber       = pinObject.getNumber();
		var pinValue        = pinObject.getValue();
		if (highestValue === undefined){
			highestValue = pinObject.getHigestValue();
		}
		super('thermo-ctrl', left, top, pinNumber, pinValue, highestValue, pinObject.getDeviceID());
		this.maxheight = 140;
		this.yStart = 15;
		var ratio = highestValue / pinObject.getHigestValue();
		this.setPinValueRatio(ratio);
		this.setValue(super.getPinValue());
		pinObject.addControl(this);
	}

	getRect(){ return $('#' + super.getId() + '> svg > .control');}
	getText(){ return $('#' + super.getId() + '> svg > .text-value');}
	
	setBarHeight(value,rect){
		/*  set the height of the bar
			This is the value 
					when meter is 100% then line y=15 and height=140
					yStart = 15 ; maxheight = 140  VALFACT = percentage / 10
					formula for height = maxheight - ( maxheight*(1 - VALFACT) )
					formula for y      = maxheight * ( 1 - VALFACT ) + yStart
					calculation for 30% is 	VALFACT = 30/10 = 0.3 ;  y = 140 * ( 1 - 0.3) + yStart ; height = 140 - ( 140 * (1 - 0.3) ) 
				*/
		var y=113, height=0;
		var  VALFACT = value / 100;
		
		y      = this.maxheight * ( 1 - VALFACT ) + this.yStart;
		height = this.maxheight - ( this.maxheight*(1 - VALFACT) );
		rect.attr('y',y);
		rect.attr('height',height);
		
		
	}
	scale(value){
		super.scale($('#' + super.getId() + '> svg'), value);
	}
	rotate(degrees){
		super.rotate($('#' + super.getId() + '> svg'), degrees);
	}
	active(bPowerOn){
		var color = '#cccccc',
		    textColor = '#cccccc';
		if (bPowerOn === true){
			color = '#E60000';
			textColor = 'yellow';
				
		}

		this.getRect().css({ fill: color });
		this.getText().css({ fill: textColor });
	}

	setValue(value){
		//todo: make the selector for rect and text
		//relative to svg.  that is class like
		this.active(true);
		super.setPinValue(value*this.pinValueRatio);
		var textNumber = this.getText();
		textNumber.text(Math.round(super.getPinValue()*10)/10+'°');
		var rect = this.getRect();
		this.setBarHeight(super.scaleValue(),rect);
		
	}

	addTicks(count){
		var stepNum = this.getHigestValue() / count;
		var num,i,y;
				/*
			This is the value 
					when meter is 100% then line y=15 and height=140
					yStart = 15 ; maxheight = 140  VALFACT = percentage / HIGESTVALUE
					formula for height = maxheight - ( maxheight*(1 - VALFACT) )
					formula for y      = maxheight * ( 1 - VALFACT ) + yStart
					calculation for 30% is 	VALFACT = 30/10 = 0.3 ;  y = 140 * ( 1 - 0.3) + yStart ; height = 140 - ( 140 * (1 - 0.3) ) 
				*/
		var  VALFACT;

		for(i = 0; i< count+1; i++){
			num = (i * stepNum);
			VALFACT = num / (this.getHigestValue());
			y      = this.maxheight * ( 1 - (VALFACT) ) + this.yStart;
			this.addTick(y, Math.round(num), i===0);
			
		}
	}

	addTick(y, text, first){
		var svg = document.querySelector('#' + super.getId() + '> svg');
		var x1 = 20, x2 = 27;
		if (first !== undefined && first === true){x1 = 18; x2=20;}

		var ElText= super.makeSVG(
			'text', 
			{x: x1-2, y: y, dy:'.32em', style: 'text-anchor: end; fill: rgb(119, 119, 119); font-size: 10px'});

		var line= super.makeSVG(
			'line', 
			{x1:x1, y1:y, x2:x2, y2:y, style: 'stroke:rgb(153,153,153);stroke-width:1.5x'});
		
		svg.appendChild(line);
		var textNode = document.createTextNode(text);

		ElText.appendChild(textNode);
		svg.appendChild(ElText);
	}

	setPinValueRatio(ratio){
		this.pinValueRatio = ratio;
	}

}//class

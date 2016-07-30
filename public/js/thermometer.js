//todo: nú vantar map function hún segir til um hæstu tölu og lægstu
//todo: gera makeScale function sem addar skala á glasið.  makeScale þarf að hafa option hvort þú viljir bara sjá strikin eða hvort eigi að bæta við tölunum. °

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes  and
http://www.2ality.com/2015/02/es6-classes-final.html */

"use strict";
class ControlElement { 
	constructor(name, nameExtender, left, top) {
		
		this.left = left;
		this.top = top;
		this.name = name;
		this.nameExtender = nameExtender;
		var $div = $("#"+name);
		var $klon = $div.clone().show("fast").prop('id', this.getId() ).prop('left', this.left ).prop('top', this.top);
		
		$('#controls').append($klon);
		$("#"+this.getId()).css({top: top, left: left});
		
	}
	getId() 	{return this.name + this.nameExtender;}
	logString()	{ return '(' + this.left + ',' + this.top + ') name:' +  this.name+ ' id:' +  this.getId();}
	log() 		{		console.log(this.logString()) ;	}

	getLeft() {return this.left;}
	getTop() {return this.top;}
	getName() {return this.name;}

	setLeft(left) {this.left = left;}
	setTop(top) {this.top = top;}
	setName(name) {this.name = name;}
}

class PinView extends ControlElement {
	constructor(name, left, top, pinNumber, pinValue, highestValue){
		super(name, pinNumber, left, top);
		this.pinNumber = pinNumber;
		this.pinValue = pinValue;
		if (highestValue !== undefined) {
			this.setHigestValue(highestValue);
		}
		else {
			this.setHigestValue(100);
		}
		
	}
	logString()	{return super.logString() + ' pinNumber: ' + this.pinNumber + ' pinValue:' + this.pinValue + ' higestValue:' + this.higestValue;}
	log() 		{	console.log(this.logString());	}
	setPinNumber(pinNumber)	{this.pinNumber = pinNumber;}
	setPinValue(pinValue)	{this.pinValue = pinValue;}
	setHigestValue(higestValue)	{this.higestValue = higestValue;}

	getPinNumber()			{return this.pinNumber;}
	getPinValue()			{return this.pinValue;}
	getHigestValue()			{return this.higestValue;}
	
	scaleValue(){return ( 100 * this.getPinValue() ) / this.getHigestValue();}

}


//make copy element and give it the element ID+pinNumber
class ThermoPin extends PinView {
	constructor(name, left, top, pinNumber, pinValue, highestValue){
		super(name, left, top, pinNumber, pinValue, highestValue);
		this.maxheight = 140;
		this.yStart = 15;
		this.setPinValueRatio(1);
		this.setValue(super.getPinValue());
	}
	
	setBarHeight(value,rect){
		//set the height of the bar
		/*
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
	scale(scaleValue){
		//todo: make the selector for rect and text
		//relative to svg.  that is class like
		//var svg = $('#' + super.getId() + '> svg');
		var s = scaleValue;
		/*var str = 	"zoom: "+s+";"                     +
					"-moz-transform: scale("+s+");"    +
					"-moz-transform-origin: 0 0;"      +
					"-o-transform: scale("+s+");"      +
					"-o-transform-origin: 0 0;"        +
					"-webkit-transform: scale("+s+");" +
					"-webkit-transform-origin: 0 0;"   +

					"transform: scale("+s+");"         + 
					"transform-origin: 0 0;"  
		console.log(str);
		*/
		// for chrome and edge
		var $svg = $('#'+super.getId()+' > svg');
		$svg.animate({ 'zoom': scaleValue }, 0);
		// for firefox
		$svg.css("-moz-transform","scale("+s+")");
		$svg.css("-moz-transform-origin","0 0"); 
		
	}
	setValue(value){
		//todo: make the selector for rect and text
		//relative to svg.  that is class like
		super.setPinValue(value*this.pinValueRatio);
		var textNumber = $('#' + super.getId() + '> svg > .text-value');
		textNumber.text(Math.round(super.getPinValue()*10)/10+'°');
		var rect = $('#' + super.getId() + '> svg > .control');
		this.setBarHeight(super.scaleValue(),rect);
		
	}
/*innerHtml : you can skip this if you don't need any innerHTML on your element*/
	makeSVG(tag, attrs, innerHtml) {
			var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
			for (var k in attrs){
				el.setAttribute(k, attrs[k]);
			}
			
			if (innerHtml !== undefined){
				el.innerHTML = innerHtml;
			}
			return el;
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

		var ElText= this.makeSVG(
			'text', 
			{x: x1-2, y: y, dy:'.32em', style: 'text-anchor: end; fill: rgb(119, 119, 119); font-size: 10px'});

		var line= this.makeSVG(
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

function onLoad(){

	var meter = new ThermoPin('thermo', 0, -180, 1, 0, 30);
	meter.addTicks(4);
	
	/* if we call the pin value on the device devicePinValue.
		and we want to be able to set that value directly with the setValue function
		then you can use the setPinValueRatio function to make the setValue function always map the  devicePinValue to the meter value
	Example: If the devicePinValue is 1023 and it reprisents the 30° on the meter
	then you can set the correct value on the meter by calling:
			meter.setPinValueRatio(30/1023);
			or more general example:
				var meter = new ThermoPin('thermo', 0, -180, 1, 0, 30);
				meter.setPinValueRatio(meter.getHigestValue()/1023);
				meter.setValue(1023);  //this will put the control to 30°
	*/
	meter.setPinValueRatio(meter.getHigestValue()/1023);
	meter.setValue(700);
	meter.scale(1.3);
}



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
	getNameExtender() 	{return this.nameExtender;}
	getId() 	{return this.name + this.nameExtender;}
	logString()	{ return '(' + this.left + ',' + this.top + ') name:' +  this.name+ ' id:' +  this.getId();}
	log() 		{		console.log(this.logString()) ;	}

	getLeft() {return this.left;}
	getTop() {return this.top;}
	getName() {return this.name;}

	setLeft(left) {this.left = left;}
	setTop(top) {this.top = top;}
	setName(name) {this.name = name;}

	scale($el, scaleValue){
		var $element;
		if (scaleValue === undefined){
			//element is not suppled;
			scaleValue = $el;
			$element = $('#' + this.getId());
		}
		else{
			 $element =  $el;
		}
		// for chrome and edge
		
		$element.animate({ 'zoom': scaleValue }, 0);
		// for firefox
		$element.css("-moz-transform","scale("+scaleValue+")");
		$element.css("-moz-transform-origin","0 0"); 
	}
	rotate(degrees){
		// for chrome and edge
		var $element = $('#' + this.getId());
		$element.css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
                 '-moz-transform' : 'rotate('+ degrees +'deg)',
                 '-ms-transform' : 'rotate('+ degrees +'deg)',
                 'transform' : 'rotate('+ degrees +'deg)'});
	}
}

class PinControl extends ControlElement {
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
	getHigestValue()		{return this.higestValue;}
	getSvg()				{ return $('#'+super.getId()+' > svg');}

	scaleValue(){return ( 100 * this.getPinValue() ) / this.getHigestValue();}
	
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
}

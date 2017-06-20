/*
        VoffCon is a system for controlling devices and appliances from anywhere.
        It consists of two programs.  A “node server” and a “device server”.
        Copyright (C) 2016  Gudjon Holm Sigurdsson

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, version 3 of the License.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program.  If not, see <http://www.gnu.org/licenses/>. 
        
You can contact the author by sending email to gudjonholm@gmail.com or 
by regular post to the address Haseyla 27, 260 Reykjanesbar, Iceland.
*/
/* 
	about ussing classes in JavaScript:
     - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes  and
     - http://www.2ality.com/2015/02/es6-classes-final.html
*/

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
	getId() 	{ return this.name + this.nameExtender;}
	getSvg()	{ return $('#'+this.getId()+' > svg');}
	logString()	{ return '(' + this.left + ',' + this.top + ') name:' +  this.name+ ' id:' +  this.getId();}
	log() 		{ console.log(this.logString()) ;	}

	getLeft()     { return this.left;}
	getTop()      { return this.top;}
	getName()     { return this.name;}

	setLeft(left) { this.left = left;}
	setTop(top)   { this.top = top;}
	setName(name) { this.name = name;}
	isFirefox()   { return (window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1);}
	scale($el, scaleValue){
		var $element;
		if (scaleValue === undefined){
			//element is not suppled;
			scaleValue = $el;
			$element = $('#' + this.getId());
			console.log("stuff1");
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
	rotate($el, degrees){
		var $element;
		if (degrees === undefined){
			//element is not suppled;
			degrees = $el;
			$element = $('#' + this.getId());
			console.log("stuff2");
		}
		else{
			 $element =  $el;
		}
		$element.css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
                      '-moz-transform' : 'rotate('+ degrees +'deg)',
                      '-ms-transform' : 'rotate('+ degrees +'deg)',
                      'transform' : 'rotate('+ degrees +'deg)'});
	}

	destroyElement() {$('#' + super.getId()).remove();}

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

class PinControl extends ControlElement {
	constructor(name, left, top, pinNumber, pinValue, highestValue, deviceID){
		var nameExtender;
		if (deviceID !== undefined || deviceID !== null){
				nameExtender = deviceID + '_' + pinNumber;
		} else {
			nameExtender = pinNumber;
		}
		super(name, nameExtender, left, top);
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
}

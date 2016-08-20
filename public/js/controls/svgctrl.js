"use strict";
/*
Use this control to display graphics on the screen.
You can add rectangles, lines, text and other svg items
to the control to make your cards prettyer.
*Note the svg text element will not work in microsoft Edge.
*/
class SvgCtrl extends ControlElement {
	constructor(idExtender, left, top, width, height){
		super('svg-ctrl', idExtender,  left, top);
		var svg = super.getSvg();
		svg.attr('width', width);
		svg.attr('height', height);
	}
	getSvgText() { return $('#'+this.getId()+' > svg > text');}

	/*this function should be enough but the other add functions I add to simplify usages (or explain usages*/
	addItem(tag, attributes, innerHtml){
		var obj= super.makeSVG(tag,	attributes, innerHtml);
		var svg = super.getSvg();
		svg.append(obj);
	}
	addLine(x1, y1, x2, y2, style){
		var obj= super.makeSVG(
				'line', 
				{x1:x1, y1:y1, x2:x2, y2:y2, style: style});
		var svg = super.getSvg();
		svg.append(obj);
	}
	/*this does not work on microsoft Edge hopefully they will fix this  in the next version*/
	addText(x, y, text, style){
		var obj= super.makeSVG(
				'text', 
				{x:x, y:y, style: style},
				text);
		var svg = super.getSvg();
		var elm = svg.append(obj);
		
		
	}
	addRect(x, y, width, height, style){
		var obj= super.makeSVG(
				'rect', 
				{x:x, y:y, width:width, height:height, style: style});
		var svg = super.getSvg();
		svg.append(obj);
	}
}//class

class SvgCtrl extends ControlElement {
	constructor(idExtender, left, top, width, height){
		super('svg-ctrl', idExtender,  left, top);
		var svg = super.getSvg();
		svg.attr('width', width);
		svg.attr('height', height);
	}
	//getSvgText() { return $('#'+this.getId()+' > svg > text');}

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

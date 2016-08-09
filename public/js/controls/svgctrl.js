class svgCtrl extends ControlElement {
	constructor(idExtender, left, top, width, height){
		super('svgctrl', idExtender,  left, top);
		var svg = super.getSvg();
		svg.attr('width', width);
		svg.attr('height', height);

	}
	
	addItem(tag, attributes){
		var obj= super.makeSVG(tag,	attributes);
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
	addRect(x, y, width, height, style){
		var obj= super.makeSVG(
				'rect', 
				{x:x, y:y, width:width, height:height, style: style});
		var svg = super.getSvg();
		svg.append(obj);
	}

}//class

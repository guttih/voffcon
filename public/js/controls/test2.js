var device1, device2, device3;

function updateView(device, pinValues ) {
		for(var i = 0; i<pinValues.length;i++){
			device.get(pinValues[i].pin).setValue(pinValues[i].val);			
			
		} // for
}
function getDevice(pin){
	switch(pin.deviceID) {
		case 2: return device2;
		case 3: return device3;
	}
	return device1;
}
function onClickCAllback(obj){
	var pin = obj.pinObject;
	var value = obj.getPinValue();
	pin.active(false);
	var sendObj = {};
	sendObj[pin.getNumber()] = value;
	var dev = getDevice(pin);
	var posting = $.post( pin.host+'/pins', sendObj);
	posting.done(function(data){
		updateView(dev, data.pins);
	});
}
/*
function fetchPinValues(){
	console.log('fetchPinVaues');
	var posting = $.get( pins.host+'/pins');
	posting.done(function(data, ss){
		console.log("ss");
		console.log(ss);
		console.log("data");
		console.log(data);
		updateView(data.pins);
	})
	.fail(function(data){
		console.log('fetchPinValues::fail');
	})
	.always(function(data){
		console.log('fetchPinValues::always');
	});
}*/

var setupAppPins = function setupAppPins(device, xBase, yBase){

	var pin, d,s, x=xBase, offsetX=0, marginX=40, offsetY=yBase;
	if (device.isFirefox()){
		offsetX=43;
		offsetY+=-23;
	}
	for(var i = 0; i < device.pins.length; i++) {
		
		pin = device.pins[i];
		d = new DiodeCtrl(marginX+x,yBase,pin);
		s = new SliderCtrl(marginX+x-(32+offsetX), 75+offsetY, pin);
		x = x + 25;
		s.rotate(270);
		s.scale(0.7);
		pin.registerClicks(onClickCAllback);
	}
};

var setupFailed = function setupFailed(data){
	console.log('Setup failed');
	console.log(data);
};
//to run javascript stored in a string
function runCodeString(str){
	var F = new Function(str);
	return(F());
}
function drawControls(name, device, xOff, yOff){
	var x = xOff+25,
		y = yOff-20;
	var svg =  new SvgCtrl(name, x, y, 400, 300);
	svg.addItem('rect',{x:2, y:10, width:250, height:175, rx:10, ry:10,
	style:'fill:gray;stroke:gray;stroke-width:1;fill-opacity:0.1;stroke-opacity:0.9'});

	var text = new SvgCtrl(name+'t1', x+45,y+166, 200, 50);	
	text.addText(20, 11, device.host, "fill:#283438;font-size:11px;");

	device.fetchAllPins(function(){setupAppPins(device, xOff, yOff);}, setupFailed);
}
function onLoad(){
/*	var svg = new SvgCtrl('backImage', 25,-20, 400, 300);
	svg.addItem('rect',{x:2, y:2, width:250, height:165, rx:10, ry:10,
	style:'fill:gray;stroke:gray;stroke-width:1;fill-opacity:0.1;stroke-opacity:0.9'});
	device = new Device('http://192.168.1.151:5100', 1023);
	device.fetchAllPins(function(){setupAppPins(0,0);}, setupFailed);
	xOff = 300; 
	yOff = 300;
  
*/

var maxValue = 1023;
 device1 = new Device('http://192.168.1.151:5100', maxValue);
 device2 = new Device('http://192.168.1.152:5100', maxValue);
 device3 = new Device('http://192.168.1.153:5100', maxValue);
 drawControls('backImage1', device1, 100, 0, 1023);
 drawControls('backImage2', device2, 100, 180, 1023);
 drawControls('backImage3', device3, 100, 360, 1023);
 

}

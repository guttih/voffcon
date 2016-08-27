var using = ["DiodeCtrl", "SliderCtrl", "SvgCtrl"];

var device1, device2, device3, device4;

function updateView(device, pinValues ) {
		log("updateView start");
		for(var i = 0; i<pinValues.length;i++){
			device.get(pinValues[i].pin).setValue(pinValues[i].val);			
			
		} // for
		log("updateView end");
}
function getDevice(pin){
	switch(pin.deviceID) {
		case 2: return device2;
		case 3: return device3;
		case 4: return device4;
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
function log(str){
	$('#bottom').append('<p>'+str+'</p>');
}
function logObj(obj){
	var str;
	str = JSON.stringify(obj, null, 4); // (Optional) beautiful indented output.
	console.log(obj); // Logs output to dev tools console.
	var temp = "<hr><pre>"+ str +"</pre><hr>"; 
	$('#bottom').append(temp);
}

$(function () {
    $("#controls").css("min-height", "350px");  
	var maxValue = 1023;
	device1 = new Device('http://192.168.1.151:5100', maxValue);
	device2 = new Device('http://192.168.1.152:5100', maxValue);
	device3 = new Device('http://192.168.1.153:5100', maxValue);
	device4 = new Device('http://192.168.1.154:5100', maxValue);
	drawControls('backImage1', device1, 100, 0, 1023);
	drawControls('backImage2', device2, 360, 0, 1023);
	drawControls('backImage3', device3, 100, 190, 1023);
	drawControls('backImage4', device4, 360, 190, 1023);
});

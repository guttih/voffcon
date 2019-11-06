//use the using array to include external controls into you card
var using = ["DiodeCtrl", "SliderCtrl", "SvgCtrl"];

/*
    Contolling all pins on a device using
    SliderCtrl for changing values
    DiodeCtrl for displaying values and
    SvgCtrl to make things a little prettier
*/

// Set the ID of the device you want to control with this card
var deviceId = '5dc29ce39af1a042287a2897';


var device1;

function updateView(device, pinValues ) {

    for(var i = 0; i<pinValues.length;i++) {
    	device.get(pinValues[i].pin).setValue(pinValues[i].val);
	} 
}


function onClickCAllback(obj){
	var pin = obj.pinObject;
	var value = obj.getPinValue();
	pin.active(false);
	var sendObj = {};
	sendObj[pin.getNumber()] = value;
	
	var url = getServer()+'/devices/pins/'+ pin.savedDeviceID;
	var posting = $.post( url, sendObj);
	posting.done(function(data){
		updateView(device1, data.pins);
	});
}

function setupAppPins(device, xBase, yBase){
    console.log("setupAppPins");
    console.log(device.pins);
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
	
	//calculating width of the rectangle surrounding the sliders
	var newWidth = Math.round(24.666667*device.pins.length) + 28; //14px magin on left and right
	$('#svg-ctrlbackImage1 > svg > rect').attr('width', newWidth+'px');
	var left = 102+(newWidth/2)-72;
    $('#svg-ctrlbackImage1t1').css('left', left+'px')
}

var setupFailed = function setupFailed(data){
	console.log('Setup failed');
	console.log(data);
};

function drawControls(name, device, xOff, yOff){
	var x = xOff+25,
		y = yOff-20;
	var pinCount = 16;
	console.log(device.pins)
	var svgWidth = Math.round(pinCount * 26.875);
	var svg = new SvgCtrl(name, x, y, svgWidth+10, 250);
	svg.addItem('rect',{x:2, y:10, width:430, height:175, rx:10, ry:10,
	style:'fill:gray;stroke:gray;stroke-width:1;fill-opacity:0.1;stroke-opacity:0.9'});

	var text = new SvgCtrl(name+'t1', x+120,y+166, 200, 50);	
	text.addText(20, 11, device.savedDeviceID, "fill:#283438;font-size:11px;");
	device.fetchAllPins( 
	    function(){  setupAppPins(device, xOff, yOff);  },
        setupFailed 
    );
}

$(function () {
    //Here starts the card.
    $("#controls").css("min-height", "350px");  
	var maxValue = 1023;
	device1 = new Device(deviceId, maxValue);
	drawControls('backImage1', device1, 100, 0, 1023);
});

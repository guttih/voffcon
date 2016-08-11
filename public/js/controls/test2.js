var pin1, pin2,
	switch1, meter1, diode1, slider1, text1,
	switch2, meter2, diode2, slider2, text2;
var timer1;
const TIMEOUT = 1000;

function updateView( pinValues ) {
		for(var i = 0; i<pinValues.length;i++){
			pins.get(pinValues[i].pin).setValue(pinValues[i].val);			
			
		} // for
}

function onClickCAllback(obj){
	console.log('onClickCAllback');
	var pin = obj.pinObject;
	var value = obj.getPinValue();
	pin.active(false);
	var sendObj = {};
	sendObj[pin.getNumber()] = value;
	var SERVERURL = pin.host;
	var posting = $.post( SERVERURL+'/pins', sendObj);
	posting.done(function(data){
		updateView(data.pins);
	});
}


function fetchPinValues(){
	console.log('fetchPinVaues');
	var posting = $.get( pins.host+'/pins');
	posting.done(function(data){
		updateView(data.pins);
	})
	.fail(function(data){
		console.log('fetchPinValues::fail');
	})
	.always(function(data){
		console.log('fetchPinValues::always');
	});
}

var pins;
var controls;
var d ,t,s;

var setupAppPins = function setupAppPins(){
	var pin, d,s, i=0, offsetX=0, baseX=40, offsetY=0;
	if (pins.isFirefox()){
		offsetX=43;
		offsetY=-23;
	}
	for(var x = 0; x < pins.pins.length; x++) {
		
		pin = pins.pins[x];
		d = new DiodeCtrl(baseX+i,0,pin);
		s = new SliderCtrl(baseX+i-(32+offsetX), 75+offsetY, pin);
		i = i + 25;
		s.rotate(270);
		s.scale(0.7);
		pin.registerClicks(onClickCAllback);
	}
	
};
var failSetup = function failSetup(data){
	console.log('failSetup');
	console.log(data);
};

function runCodeString(str){
	var F = new Function(str);
	return(F());
}
function onLoad(){
	var str = "var svg = new SvgCtrl('backImage', 25,-20, 400, 300);" +
	"controls = [];" +
	"var maxValue = 1024;" +
	"pins = new Pins('http://192.168.1.151:5100', 1023);" +
	
	"pins.fetchAllPins(setupAppPins, failSetup);" +
  
    "svg.addItem('rect',{x:2, y:2, width:250, height:165, rx:10, ry:10," +
	"style:'fill:gray;stroke:gray;stroke-width:1;fill-opacity:0.1;" + "stroke-opacity:0.9'});";
	//runCodeString(str);
	var svg = new SvgCtrl('backImage', 25,-20, 400, 300);
	controls = [];
	var maxValue = 1024;
	pins = new Pins('http://192.168.1.151:5100', 1023);
	
	pins.fetchAllPins(setupAppPins, failSetup);
  
    svg.addItem('rect',{x:2, y:2, width:250, height:165, rx:10, ry:10,
	style:'fill:gray;stroke:gray;stroke-width:1;fill-opacity:0.1;stroke-opacity:0.9'});
}

var device;

function updateView( pinValues ) {
		for(var i = 0; i<pinValues.length;i++){
			device.get(pinValues[i].pin).setValue(pinValues[i].val);			
			
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

var setupAppPins = function setupAppPins(){
	var pin, d,s, i=0, offsetX=0, baseX=40, offsetY=0;
	if (device.isFirefox()){
		offsetX=43;
		offsetY=-23;
	}
	for(var x = 0; x < device.pins.length; x++) {
		
		pin = device.pins[x];
		d = new DiodeCtrl(baseX+i,0,pin);
		s = new SliderCtrl(baseX+i-(32+offsetX), 75+offsetY, pin);
		i = i + 25;
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
function onLoad(){

	var svg = new SvgCtrl('backImage', 25,-20, 400, 300);
	var maxValue = 1024;
	device = new Device('http://192.168.1.151:5100', 1023);
	
	device.fetchAllPins(setupAppPins, setupFailed);
  
    svg.addItem('rect',{x:2, y:2, width:250, height:165, rx:10, ry:10,
	style:'fill:gray;stroke:gray;stroke-width:1;fill-opacity:0.1;stroke-opacity:0.9'});
}

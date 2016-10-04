
var deviceStarted;

function getDeviceStartTime(){
	$elm = $('#status-text');
	requestData(SERVER+'/devices/started/'+device.id, function(data){
		var date = data.date;
		deviceStarted = new Date(date.year, date.month-1, date.day, date.hours, date.minutes, date.seconds, 0);
		var strDate = formaTima(deviceStarted);
		$('#server-started').text(strDate);
		
		$elm.text("Successfully connected to the device.").removeClass("alert-warning").addClass("alert-success");
	},function(data){
		$elm.text("Unable to connect to this device.").removeClass("alert-warning").addClass("alert-danger");
	});
}

function getPins(){
	requestData(SERVER+'/devices/pins/'+device.id, function(data){
		setPinValues(data);
	});
}

function getModeString(mode){
	var str ='(' + mode + '): ';

	switch (mode){
		case 0:  str+="INPUT"; break;
		case 1:  str+="OUTPUT"; break;
		case 2:  str+="INPUT_PULLUP"; break;
	}
	return str;
}

function setPinValues(data){
	var pins = data.pins;
	var modeStr;
	var $elm = $('#table-pins tbody');
	var row;
	$('#pin-count').text(pins.length);
	for(var i = 0; i < pins.length; i++){
		modeStr = getModeString(pins[i].m);
		modeStr = '<code style="color:black">'+modeStr+'</code>';
		row = "<tr><td>"+pins[i].pin+"</td><td>"+pins[i].val+"</td><td>"+modeStr+"</td></tr>";
		$elm.append(row);
	}
	console.log("pins");
	console.log(pins);
}

function setDeviceValues(device){
	$('#device-id').text(device.id);
	$('#device-name').text(device.name);
	$('#device-url').text(device.url);
	$('#device-description').text(device.description);
}


function initBtnProgram(){
	$('#btn-download-program').click(function() {
		window.location.assign('/devices/program/'+device.id);
		});
}


$(function () {
	console.log("device");
	console.log(device);
	getDeviceStartTime();
	getPins();
	setDeviceValues(device);
	initBtnProgram();
});
/*
        Ardos is a system for controlling devices and appliances from anywhere.
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

var deviceStarted;
var inputDialog = $('#getNum');
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

function getPinoutName(pinOuts, pinNumber){
	var keys = Object.keys(pinOuts);
 	var i, key;
	 for (i = 0; i<keys.length; i++){
		 	key = keys[i];
				if (pinOuts[key]===pinNumber){
					return key;
				}
			}

}

function getPinout(){
	requestData(SERVER+'/devices/pinout/'+device.id, function(pinOutdata){
		console.log(pinOutdata);
		requestData(SERVER+'/devices/pins/'+device.id, function(data){

			var name;
			for(var i = 0; i < data.pins.length; i++){
				name = getPinoutName(pinOutdata, data.pins[i].pin);

				if (name !== undefined){
					console.log("found it");
					data.pins[i].name = name;
				}
			}
			console.log(data.pins);
			setPinValues(data);
			registerOnClickValue(data);
		});
		
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


function registerOnClickValue(data){
	var pins = data.pins;
	var pin, val;
	var $elm;
	for(var i = 0; i < pins.length; i++){
		$elm = $('#val'+pins[i].pin);
		$elm.on( "click", function() {
			var id = $( this ).attr("id");
			pin = id.substring(3);
			val = $( this ).text();
			showInputDialog(pin, val);
			
		});
	}
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
		row = '<tr>'+
			'<td>'+pins[i].name+'</td>'  +
			'<td>'+pins[i].pin+'</td>'  +
			'<td id="val'+ pins[i].pin +'">'+pins[i].val+'</td>'  +
			'<td>'+modeStr+'</td></tr>';
		$elm.append(row);
	}
}

function setDeviceValues(device){
	$('#device-id').text(device.id);
	$('#device-name').text(device.name);
	$('#device-type').text(device.type);
	$('#device-url').text(device.url);
	$('#device-description').text(device.description);
}


function showInputDialog(pin, val){
	$('#inputDialogPin').text(pin);
	$('#inputDialogValue').val(val);
	inputDialog.show();
	$('.overlay').show();
	

}
function updatePinValues(pins){
	var pin, val, $elm;
	for(var i = 0; i<pins.length; i++){
		pin = pins[i].pin;
		val = pins[i].val;
		$elm = $('#val'+pin); 
		$elm.text(val);
		 $('#val'+pin).removeClass("unknownValue");



	}
}
function init(){
	$('#btn-download-program').click(function() {
		window.location.assign('/devices/program/'+device.id);
	});
	
	inputDialog.hide();
	$('#btnSetPinValue').click(function() {
		$('.overlay').hide();
		inputDialog.hide();

		var pin = $('#inputDialogPin').text();
		var val = $('#inputDialogValue').val();
		 $('#val'+pin).addClass("unknownValue");
		var deviceId = $('#device-id').text();
		
		//pin.active(false); gray the cell
		var sendObj = {};
		sendObj[pin]=val;
		var url = SERVER+'/devices/pins/'+deviceId;
		var posting = $.post( url, sendObj);

		posting.done(function(data){
			console.log(data);
			updatePinValues(data.pins);
		});

	});
	inputDialog.hide();
	$('#btnCancelSetPin').click(function() {
		$('.overlay').hide();
		inputDialog.hide();
	});
	
	//select all text when control gets focus
	$('#inputDialogValue').focus(function() { $(this).select(); } );
	
}


$(function () {
	console.log("device");
	console.log(device);
	getDeviceStartTime();
	setDeviceValues(device);
	getPinout();
	init();
});

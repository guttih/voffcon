/*
        VoffCon is a system for controlling devices and appliances from anywhere.
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
/*function getDeviceStartTime(){
	$elm = $('#status-text');
	requestData(SERVER+'/devices/started/'+device.id, function(data){
		setStartTime(data.date);
	},function(data){
		$elm.text("Unable to connect to this device.").removeClass("alert-warning").addClass("alert-danger");
	});
}*/

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
var setPinoutValues = function setPinoutValues(pins, pinOutdata) {
	
			var name;
			/*for(var i = 0; i < pins.length; i++){
				if (pinOutdata !== undefined) {
					name = getPinoutName(pinOutdata, pins[i].pin);
				} else {
					if (pins[i].name !== undefined){
						name pins[i].name;
					}
				}
			}*/
			console.log(pins);
			setPinValues(pins);
			registerOnClickValue(pins);
}

function getPinout(){
	requestData(SERVER+'/devices/pinout/'+device.id, function(pinOutdata){
		console.log(pinOutdata);
		requestData(SERVER+'/devices/pins/'+device.id, function(data){
			setPinoutValues(data, pinOutdata);
		});
		
	});
}

function getModeString(mode){
	var str ='(' + mode + '): ';

	switch (mode){
		case 0:  str+="INPUT_ANALOG"; break;
		case 1:  str+="INPUT_DIGITAL"; break;
		case 2:  str+="OUTPUT_ANALOG"; break;
		case 3:  str+="OUTPUT_DIGITAL"; break;
		case 4:  str+="OUTPUT_VIRTUAL"; break;
		default: str+="invalid type";
	}
	return str;
}


function registerOnClickValue(pins){
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

function getPinsFromTable(){
	var pins= [];
	var item;
	var table = document.getElementById("table-pins");
	for (var i = 2; i < table.rows.length -1 ;  i++) {
		var row = table.rows[i]
		item = {};
		item.name = row.cells[0].textContent;
		item.pin =  Number(row.cells[1].textContent);
		item.val =  Number(row.cells[2].textContent);
		e =document.getElementById("m"+item.pin);
		item.m = Number(e.options[e.selectedIndex].value);
		pins.push(item);
	}
	//pins.push({name: 'D0', pin:0, val: 10, m : 0 });
	return pins;
}

function  isCheckboxChecked() {
	return $('#chkPrepForDownload').is(':checked');
}

function enableInputSelects(enable){
	
		if (enable === true){
			$(".select-mode").removeAttr('disabled');
			$('#btn-download-program').removeAttr('disabled');
		} else{
			$(".select-mode").attr('disabled', 'disabled');
			$('#btn-download-program').attr('disabled', 'disabled');
			
		}
}

$('#chkPrepForDownload').click(function() {
	if (!isCheckboxChecked()){
		//let's just reload the page to be sure to get all current device values
		location.reload();
	}
	enableInputSelects(isCheckboxChecked());
});

function setPinValues(pins){
	
	var modeStr;
	var $elm = $('#table-pins tbody');
	var row;
	$('#pin-count').text(pins.length);
	for(var i = 0; i < pins.length; i++){
		modeStr = makeHtmlSelectString(pins[i].pin, pins[i].m);
		row = '<tr>'+
			'<td>'+pins[i].name+'</td>'  +
			'<td>'+pins[i].pin+'</td>'  +
			'<td id="val'+ pins[i].pin +'">'+pins[i].val+'</td>'  +
			'<td>'+modeStr+'</td></tr>';
		$elm.append(row);
	}
	enableInputSelects(isCheckboxChecked());
	if (pins.length > 0 ) {
		$("button.btn-log-pins").removeAttr('disabled');
		$("button.btn-log-monitors").removeAttr('disabled');
		
	}
}

function setDeviceValues(device){
	$('#device-id').text(device.id);
	$('#device-name').text(device.name);
	$('#device-type-name').text(device.typeName);
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

function updateWhitelist(whitelist) {
	console.log("updateWhitelist");
	console.log(whitelist);
	var pin, val, $select, $input, addedIndex = 0;
	
	$input = $('#inputIpAddress');
	var ipAdded = $input.val();
	$input.removeClass("unknownValue").val("");
	$select = $('#whitelist');
	$select.empty();

	for(var i = 0; i<whitelist.length; i++){
		$select.append('<option value="'+i+'">' +whitelist[i] + '</option>');
		if (ipAdded === whitelist[i]) {
			addedIndex = i;
		}
	}
	$('#whitelist option:eq(' + addedIndex +')').prop('selected', true); 
	
}

function sendNewIpToWhiteList(){
		var val = $('#inputIpAddress').val();
		 $('#inputIpAddress').addClass("unknownValue");
		var deviceId = $('#device-id').text();
		
		var sendObj = {
			"ipaddress":val
		};
		var url = SERVER+'/devices/whitelist/'+deviceId;
		var posting = $.post( url, sendObj);

		posting.done(function(data){
			console.log(data);
			updateWhitelist(data);
		})
		.fail(function()  {
    alert("Sorry. Server unavailable. ");
}); 
}
function sendGetStatus(){
	console.log("sendGetStatus()");
	var deviceId = $('#device-id').text();
	
	var url = SERVER+'/devices/status/'+deviceId;
	console.log(url);
	$elm = $('#status-text');

	requestData(url, function(data){
		console.log(data);
		setStartTime(data.date);
		//getDeviceStartTime();
		//getPinout();
		setPinoutValues(data.pins);
		updateWhitelist(data.whitelist);
	},function(data){
		$elm.text("Unable to connect to this device.").removeClass("alert-warning").addClass("alert-danger");
	});
}

function RemoveIpFromWhiteList() {
	console.log("RemoveIpFromWhiteList");
	var ipAddress = $("#whitelist option:selected").text();
	var deviceId = $('#device-id').text();
	console.log("todo: remove :" + ipAddress);
	var sendObj = {
			"ipaddress":ipAddress
		};

	var url = SERVER+'/devices/whitelist/'+deviceId;
		var deleting = $.delete( url, sendObj);

		deleting.done(function(data){
			console.log(data);
			updateWhitelist(data);
		});
}
function downloadFile(filename, data) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}
function download(data) {
    if (device.type == 1){
		downloadFile("DeviceServerEsp32.ino", data);
	} else {
		downloadFile("DeviceServerNodeMcu.ino", data);
	}
}


function makeHtmlSelectOptionString(value, displayString, selected){
    var str, selectStr='';
    if (selected !== undefined && selected === true) {
        selectStr = ' selected="selected"';
    }
    
    str = '<option value="' + value + '"' + selectStr + '>' + displayString + '</option>';
    return str;

}

function makeHtmlSelectString(pin, mode){
	var str ='<select id="m' + pin + '" class="select-mode form-control">';
    str += makeHtmlSelectOptionString(0, "INPUT_ANALOG", mode === 0);
    str += makeHtmlSelectOptionString(1, "INPUT_DIGITAL", mode === 1);
    str += makeHtmlSelectOptionString(2, "OUTPUT_ANALOG", mode === 2);
	str += makeHtmlSelectOptionString(3, "OUTPUT_DIGITAL", mode === 3);
	str += makeHtmlSelectOptionString(4, "OUTPUT_VIRTUAL", mode === 4);
	
    str +='</select>';
	return str;
}
function getWhiteListFromSelect(){
	var ret = [];
	$("#whitelist option").each(function(){
		var text = $(this).text();
		console.log(text);
		ret.push(text);
	});
	return ret;
}

function init(){
	$('#btn-download-program').click(function() {
		//window.location.assign('/devices/program/'+device.id);
		var sendObj = {};
		var x=1;
		if (isCheckboxChecked()){
			//only add pin values when hardware is selected
			sendObj["pins"]=JSON.stringify(getPinsFromTable());
			sendObj["whitelist"]=JSON.stringify(getWhiteListFromSelect());
		}

		var url = SERVER+'/devices/program/'+device.id;
		var posting = $.post( url, sendObj);

		posting.done(function(data){
			download(data);
		});
	});

	$('button.btn-log-pins').click(function() {
		var url = SERVER+'/logs/pins/'+device.id;
		$.ajaxSetup({timeout:5000});
		var request = $.get(url);
		request.done(function( data ) {
			var message = "Device pin values have been successfully saved to the log";
			message+="\n\n";
			message+='<a href="'+SERVER+'/logs/device/'+device.id+'">View logs for this device</a>';
			showModal("Success", message);
			console.log(data);
		}).fail(function( data ) {
			showModalErrorText("Logging error", "Unable to save device pin values to the log.");
		});
	});
		
	inputDialog.hide();
	$('#btnSetPinValue').click(function() {
		$('.overlay').hide();
		inputDialog.hide();

		var pin = $('#inputDialogPin').text();
		var val = $('#inputDialogValue').val();
		var $elmVal = $('#val'+pin);
		var deviceId = $('#device-id').text();
		
		if (isCheckboxChecked()){
			//not sending any data when checked
			$elmVal.removeClass("unknownValue");
			$elmVal.text(val);
			return;
		}

		$elmVal.addClass("unknownValue");
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

	$('#btnAddIp').click(function() {
		sendNewIpToWhiteList();
	});
	$('#btnRemoveIp').click(function() {
		RemoveIpFromWhiteList();
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
	setDeviceValues(device);
	sendGetStatus();
	init();
});

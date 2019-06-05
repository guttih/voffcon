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

function sendData(subUrl, data, callback, errorCallback){
		var url = SERVER + subUrl;
		var request = $.post(url, data);
	request.done(function( data ) {
		callback(data);
		}).fail(function( data ) {
			if (errorCallback !== undefined){
				errorCallback(data);
			} else {
				if (data.status===401){
					showModal("You need to be logged in!", data.responseText);
				}
			}
		});
}



function showModalMonitorError(title, text){
	showModal(title, '<div class="error-response-text">' + text + '</div>\n');
}

function showError(data){
	var text = "The monitor was not registered!";
	if (data.responseJSON !== undefined){
		text = "<br>";
		for(var i = 0; i<data.responseJSON.length; i++){
			console.log(data.responseJSON[i]);
			text += "<p>" + data.responseJSON[i].param + " : " + data.responseJSON[i].msg + "</p>";
		}
	}

	showModalMonitorError("An error Uccurred", text);
}
function doSubmit(){
	var sendObj = {};
	var url = "/monitors/register";
	if (typeof monitor !== 'undefined') {
		sendObj.id = monitor.id;
		url+= "/" + sendObj.id;
	}
	sendObj.name = $('#monitor-name').val();
	sendObj.description = $('#monitor-description').val(); 
	sendObj.url = $('#monitor-url').val();
	sendObj.type = $('#monitor-pin').val();
	
	console.log(sendObj);

	sendData(url, sendObj, function(data){
		//successfully saved this monitor
		window.location.href = '/monitors/list';
	}, showError);
}

function comparePinsNumbers(a,b) {
	if (a.pin < b.pin)
	  return -1;
	if (a.pin > b.pin)
	  return 1;
	return 0;
}

function setSelectOptionsFromArray(id, list){
	//todo: remove next line
	list.push({pin: -1, val: 0, m: 0, name: "Timer"});
	list.sort(comparePinsNumbers);
	var select = 	$("#"+id);
	var selected = select.find('option:selected');
	var required = select.attr('required') === 'required';
	select.find('option').remove();
	
	//add the first option
	var display = select.attr('name');
	display = (display === undefined ? id : display)
	var opt = new Option('No ' + display + ' selected', '');
	if (required === true) { 
		opt.setAttribute("title", 'you must add a new ' + display + ' to be able to add parts');
	} else { 
		opt.setAttribute("title", 'you are not required to select a ' + display);
	}
	select.append(opt);

	// add all options in the database
	list.forEach(element => {
		var opt = new Option(element.name, element.id);
		opt.setAttribute("title", 'Pin number ' + element.pin);
		opt.setAttribute("pin-number", element.pin);
		select.append(opt);
	});
}

var checkTimer;
function updateSubmitButtonState(){
	clearTimeout(checkTimer);
	checkTimer=setTimeout(function(){
		var form = document.getElementById('monitorform');
		var isValid = form.checkValidity();
		$( '#btn-submit-monitorform').prop('disabled', !isValid);
		
	}, 300);
}

function onInputMillisecondsChange($input, formGroupClass){
	var millis = $input.val();
	
	console.log(typeof millis);
		var max = Number($input.attr("max"));
		var min = Number($input.attr("min"));
		console.log('min:'+min+' max:'+max+' millis:'+millis);

		var text = '';
		if (millis.length > 0 && millis >= min &&  millis <= max ){
			text = msToStr(millis, true);
		}
		
		$('.'+formGroupClass+' .monitor-input-text').text(text);
}
$(function () {
	
	$("#btn-submit-monitorform").click(function() {
		doSubmit();
	});
	if (typeof monitor !== 'undefined') {
		console.log("We got a monitor and need to set form values")
		console.log(monitor);
	}

	$('#monitor-pin').on('change', function() {
		console.log($(this).val());
		pinNumber = $(this).find(":selected").attr('pin-number');
		var notATimerPin = pinNumber != -1;
		var displayText = pinNumber === undefined? '': 'Selected is pin number ' + pinNumber;
		$('.pinValueMargin,.sampleTotalCount,.sampleInterval').toggle(notATimerPin);
		$('.pinValueMargin input,.sampleTotalCount input,.sampleInterval input').prop('required', notATimerPin);
		$('.pin .monitor-input-text').text(displayText);

	});

	$('#monitor-sampleInterval').on('input', function(){
		onInputMillisecondsChange($(this), 'sampleInterval');
	});
	$('#monitor-minLogInterval').on('input', function(){
		onInputMillisecondsChange($(this), 'minLogInterval');
	});

	setSelectOptionsFromArray('monitor-pin', device.pins);
	$('input,select,textarea').on('change input', function(){
		updateSubmitButtonState();
	});
	updateSubmitButtonState();
});

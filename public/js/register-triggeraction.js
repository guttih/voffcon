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
	var text = "The triggerAction was not added";
	if (data.responseJSON !== undefined){
		text = "<br>";
		if (data.responseJSON.error !== undefined) {
			text=data.responseJSON.error;
		} else {
			for(var i = 0; i<data.responseJSON.length; i++){
				console.log(data.responseJSON[i]);
				text += "<p>" + data.responseJSON[i].param + " : " + data.responseJSON[i].msg + "</p>";
			}
		}
	}

	showModalMonitorError("An error Uccurred", text);
}
function doSubmit(){
	var $form = $("#triggerActionForm");
	var sendObj = {};
	var name, val;
	$form.find('input').each(function(){
		name = $(this).attr('name');
		val = $(this).val();
		sendObj[name]=val;
	});
	/*$form.find('textarea').each(function(){
		name = $(this).attr('name');
		val = $(this).val();
		sendObj[name]=val;
	});*/
	var select = $('#triggerAction-pin');
	var selected = 	select.find('option:selected');
	val = selected.val();
	sendObj['pin']=val;
	console.log(sendObj);
	var url = $form.attr('action');
	console.log(url);
	sendData(url, sendObj, function(data){
		//successfully saved this triggerAction
		window.location.href = '/triggeractions/device/'+device.id;
		
	}, showError);
		
}

function comparePinsNumbers(a,b) {
	if (a.pin < b.pin)
	  return -1;
	if (a.pin > b.pin)
	  return 1;
	return 0;
}


function setNumberSelectValues($elm, minNumber, maxNumber, numberSelected) {
	$elm.find('option').remove();
	for(var i = minNumber; i<maxNumber+1;i++){
		if (i === numberSelected){
			$elm.append('<option value="'+(i)+'" selected="">'+(i)+'</option>');
		}
		else{ 
			$elm.append('<option value="'+(i)+'">'+(i)+'</option>');
		}
	}

}

function setDevicesSelectValues(){
	select = $('#triggerAction-device');
	select.find('option').remove();
	console.log(devices);
	devices.forEach(element => {
		var opt = new Option(element.name, element.id);
		opt.setAttribute("title", element.description);
		//opt.setAttribute("value", element.id);
		select.append(opt);
	});
}

function setFormValues(){
	setNumberSelectValues($('#triggerAction-hour'),   0, 23, 0);
	setNumberSelectValues($('#triggerAction-minute'), 0, 59, 0);
	setNumberSelectValues($('#triggerAction-second'), 0, 59, 0);
	onSelectYearOrMonthChange();
	setDevicesSelectValues();
	onSelectDeviceChange();
	onSelectTypeChange();
	
}

var checkTimer;
function updateSubmitButtonState(){
	clearTimeout(checkTimer);
	checkTimer=setTimeout(function(){
		var form = document.getElementById('triggerActionForm');
		var isValid = form.checkValidity();
		$( '#btn-submit-triggerActionForm').prop('disabled', !isValid);
	}, 300);
}	

var onSelectDeviceChange = function onSelectDeviceChange($elm){
	if ($elm === undefined) {
		$elm = $('#triggerAction-device')
	}
	console.log($elm.val());
}
var onSelectYearOrMonthChange = function onSelectYearOrMonthChange(){
	var $daySelect = $('#triggerAction-day');
	var month =  Number($('#triggerAction-month').find(':selected').val())+1;
	var year = Number($('#triggerAction-year').find(':selected').val());
	var numberOfDays = numberOfDaysInMonth(year, month);
	var selectedDay = Number($('#triggerAction-day').find(':selected').val());
	if (selectedDay > numberOfDays) {
		selectedDay = 1;
	}
	setNumberSelectValues($('#triggerAction-day'), 1, numberOfDays, selectedDay);
	console.log(devices);
};

/**
 * Shows or hides date and time select elements
 * @param {Boolean} showDate if true year, month and day selects will be shown, otherwise hidden
 * @param {Boolean} showTime  if true hour, minute and second selects will be shown, otherwise hidden
 */
function showDateOrTime(showDate, showTime, showWeekDays){
	$('.last-day').hide();

	if (showDate || showTime) {
			$('.date-and-time-selects').show();
		}
	else {
			$('.date-and-time-selects').hide();
			return;
	}

	if (showDate){
		$('.date-select').show();
	} else {
		$('.date-select').hide();
	}
	if (showTime){
		$('.time-select').show();
	} else {
		$('.time-select').hide();
	}
	if (showWeekDays){
		$('.year,.month,.day').hide();
		$('.weekdays').show();
	} else {
		$('.weekdays').hide();
	}
	
}

var onSelectTypeChange = function onSelectTypeChange(){
	var val = $('#triggerAction-type').val();
		switch(val){
			case "ONES":		    showDateOrTime(true ,true, false);      break;
			case "TIMELY":          showDateOrTime(false,true, false);      break;
			case "DAILY":		    showDateOrTime(false,true, false);      break;
			case "WEEKLY":		    showDateOrTime(true , true,true );  	break;
			case "MONTHLY":		    showDateOrTime(true , true, false);
									$('.year,.month').hide();           	break;
			case "MONTHLY-LAST":	showDateOrTime(true ,true, false);
									$('.year,.month,.day').hide();
									$('.last-day').show();					break;
			case "YEARLY":			showDateOrTime(true , true, false);
									$('.year').hide();           			break;
			case "LOG-INSTANT":		showDateOrTime(false,false,false);  	break;
		}
}

$(function () {
	
	$("#btn-submit-triggerActionForm").click(function() {
		doSubmit();
	});

	$('#triggerAction-month,#triggerAction-year').on('change', function() {
		onSelectYearOrMonthChange();
	});
	$('#triggerAction-device').on('change', function() {
		onSelectDeviceChange($(this));
	});
	
	$('#triggerAction-type').on('input', function(){
		onSelectTypeChange();
	});

	$('#triggerAction-sampleInterval').on('input', function(){
		onInputMillisecondsChange($(this), 'sampleInterval', 'sampleTotalCount', false, true);
	});
	$('#triggerAction-sampleTotalCount').on('input', function(){
		onInputMillisecondsChange($(this), 'sampleTotalCount', 'sampleInterval', true);
	});

	setFormValues();
	
	$('input,select').on('change input', function(){
		updateSubmitButtonState();
	});
	
	updateSubmitButtonState();
	
	
});

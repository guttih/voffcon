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

	showModalMonitorError("An error Occurred", text);
}
function doSubmit(){
	var $form = $("#triggerActionForm");
	var weekdays=[];
	var sendObj = {
		
	};
	var name, val;
	$form.find('input,textarea').each(function(){
		name = $(this).attr('name');
		
		if (name !== undefined ) {
			val = $(this).val();
			sendObj[name]=val;
		}
	});

	$form.find('select option:selected').each(function(){
		name = $(this).parent().attr('name');
		if (name !== undefined ) {
			val = $(this).val();
			sendObj[name]=val;
		}
	});
	$form.find('input[type=checkbox]:checked').each(function(){
		name = $(this).attr('id');
		val = $(this).val();
			weekdays.push(val);
	});

	if (weekdays.length > 0){
		sendObj.weekdays = weekdays.join(';');
	}
	
	console.log(sendObj);
	var url = $form.attr('action');
	console.log(url);
	sendData(url, sendObj, function(data){
		//successfully saved this triggerAction
		window.location.href = '/triggeractions/list';
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

function setDevicesOptions(devices, deviceId){
	select = $('#triggerAction-deviceId');	
	select.find('option').remove();
	devices.forEach(element => {
		var opt = new Option(element.name, element.id);
		opt.setAttribute("title", element.description);
		if (deviceId === element.id) {
			opt.setAttribute("selected", "");
		}
		select.append(opt);
	});
}

function createOrSelect($elm,value){
	$elm.val(value);
	if ($elm.val() === value) {
		return;  //value existed, so we're done
	}
	var opt = new Option(value, value, true);
	$elm.prepend(opt);

}

function setFormTriggerActionValues(triggerAction) {
	console.log(triggerAction.date);
	var date = new Date(triggerAction.date);
	createOrSelect($('#triggerAction-year'),date.getUTCFullYear());
	$('#triggerAction-month').val(date.getUTCMonth());
	onSelectYearOrMonthChange();
	$('#triggerAction-day').val(date.getUTCDate());
	$('#triggerAction-hour').val(date.getUTCHours());
	$('#triggerAction-minute').val(date.getUTCMinutes());
	$('#triggerAction-second').val(date.getUTCSeconds());

	$('#triggerAction-type').val(triggerAction.type);
	$('#triggerAction-method').val(triggerAction.method);
	$('#triggerAction-url').val(triggerAction.url);
	$('#triggerAction-body').val(triggerAction.body);
	$('#triggerAction-description').val(triggerAction.description);
	
	if (triggerAction.dateData !== undefined && triggerAction.dateData !== null){
		var weekdays = triggerAction.dateData.split(';');
		weekdays.forEach(item => {
			console.log(item);
			$('.weekdays :input[value="'+item+'"]').prop( "checked", true );
		});
	}

}
function setFormValues(){
	var date = new Date();
	setNumberSelectValues($('#triggerAction-year'),   date.getUTCFullYear(), date.getUTCFullYear()+10, date.getUTCFullYear());
	setNumberSelectValues($('#triggerAction-hour'),   0, 23, 0);
	setNumberSelectValues($('#triggerAction-minute'), 0, 59, 0);
	setNumberSelectValues($('#triggerAction-second'), 0, 59, 0);
	
	
	var gotTriggerAction = typeof triggerAction !== 'undefined' && triggerAction !== 'undefined';
	var gotDevices       = typeof devices       !== 'undefined' && devices       !== 'undefined';
	var id;
	if (gotTriggerAction) {
		console.log(triggerAction);
		id = triggerAction.deviceId;
		setFormTriggerActionValues(triggerAction);
	} else {
		onSelectYearOrMonthChange();
	}
	
	if (gotDevices) {
		console.log(devices);
		setDevicesOptions(devices, id);
	}

	onSelectDeviceChange();
	onSelectTypeChange();
	onSelectMethodChange();
}

var checkTimer;
var updateSubmitButtonState = function updateSubmitButtonState(){
	clearTimeout(checkTimer);
	checkTimer=setTimeout(function(){
		var form = document.getElementById('triggerActionForm');
		var type = $('#triggerAction-type').val();
		var method = $('#triggerAction-method').val();
		if (method === 'GET'){
			$('#triggerAction-body').attr('required',false);
		} else {
			$('#triggerAction-body').attr('required',true);
		}
		var isValid = form.checkValidity();
		if (isValid && type === 'WEEKLY' ){
			isValid = $("input[type=checkbox]:checked").length > 0;
		}
		$( '#btn-submit-triggerActionForm').prop('disabled', !isValid);
	}, 300);
}	

var onSelectDeviceChange = function onSelectDeviceChange($elm){
	if ($elm === undefined) {
		$elm = $('#triggerAction-deviceId');
	}
	console.log($elm.val());
}
var onSelectYearOrMonthChange = function onSelectYearOrMonthChange(){
	var $daySelect = $('#triggerAction-day');
	var month =  Number($('#triggerAction-month').find(':selected').val())+1;
	var year = Number($('#triggerAction-year').find(':selected').val());
	var numberOfDays = numberOfDaysInMonth(year, month);
	var selectedDay = Number($('#triggerAction-day').find(':selected').val());
	if (Number.isNaN(selectedDay) || selectedDay > numberOfDays) {
		selectedDay = 1;
	}
	setNumberSelectValues($('#triggerAction-day'), 1, numberOfDays, selectedDay);
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

var onSelectMethodChange = function onSelectMethodChange(){
	var val = $('#triggerAction-method').val();
		if (val === 'GET') {
			$('.body').hide();
		} else {
			$('.body').show();
		}
}

var onSelectTypeChange = function onSelectTypeChange(){
	var val = $('#triggerAction-type').val();
		switch(val){
			case "ONES":		    showDateOrTime(true ,true, false);      break;
			case "TIMELY":          
									showDateOrTime(false,true, false);      break;
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
	$('#triggerAction-deviceId').on('change', function() {
		onSelectDeviceChange($(this));
	});
	
	$('#triggerAction-type').on('input', function(){
		onSelectTypeChange();
	});

	$('#triggerAction-method').on('change', function() {
		onSelectMethodChange();
		
	});

	setFormValues();
	
	$('input,select,textarea').on('change input', function(){
		updateSubmitButtonState();
	});
	
	updateSubmitButtonState();
});

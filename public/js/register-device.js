
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



function showModalDeviceError(title, text){
	showModal(title, '<div class="error-response-text">' + text + '</div>\n');
}

function showError(data){
	var text = "The device was not registed!";
	if (data.responseJSON !== undefined){
		text = "<br>";
		for(var i = 0; i<data.responseJSON.length; i++){
			console.log(data.responseJSON[i]);
			text += "<p>" + data.responseJSON[i].param + " : " + data.responseJSON[i].msg + "</p>";
		}
	}

	showModalDeviceError("An error Uccurred", text);
}
function doSubmit(){
	var sendObj = {};
	var url = "/devices/register";
	if (typeof device !== 'undefined') {
		sendObj.id = device.id;
		url+= "/" + sendObj.id;
	}
	sendObj.name = $('#device-name').val();
	sendObj.description = $('#device-description').val(); 
	sendObj.url = $('#device-url').val();
	console.log(sendObj);

	sendData(url, sendObj, function(data){
		//successfully saved this device
		window.location.href = '/devices/list';
	}, showError);
}

$(function () {
	
	$("#btn-submit-deviceform").click(function() {
		doSubmit();
	});
	if (typeof device !== 'undefined') {
		$('#device-name').val(device.name);
		$('#device-description').text(device.description);
		$('#device-url').val(device.url);

		$("#btn-run").click(function() {
				window.location.href = '/devices/run/' + device.id;
		});
	
		
	} else {
		$('#btn-run').hide();
	}
});
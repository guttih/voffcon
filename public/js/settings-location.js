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

var	SERVER;


function setPositionToInputs(position) {
	$('#latitude').val(position.coords.latitude);
	$('#longitude').val(position.coords.longitude);
	console.log(position.coords.latitude);
	console.log(position.coords.longitude);
	onSunRiseInputChange();
}


function showError(error) {
	switch(error.code) {
		case error.PERMISSION_DENIED    :   alert('Error: User denied the request for Geolocation.');    break;
		case error.POSITION_UNAVAILABLE :   alert('Error: Location information is unavailable.');        break;
		case error.TIMEOUT              :   alert('Error: The request to get user location timed out.'); break;
		case error.UNKNOWN_ERROR        :   alert('Error: An unknown error occurred.');                  break;
	}
}


function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(setPositionToInputs, showError);
	} else { 
		alert('Geolocation is not supported by this browser.');
	}
}

function saveLocation(){

		var sendObj = {
						latitude : $('#latitude').val(),
						longitude: $('#longitude').val()
			};
			var posting = $.post( 'settings-location', sendObj);
		posting
			.done(function(data){
				console.log(data);
				showModal("Successfully saved", "Server location has been saved.");
			})
			.fail(function(data){
				console.log("Error saving ");
				console.log(data);
				showModalErrorText('Not saved', 'There was an error saving the server location');
			});
	
}



function hideMyLocationButtonIfNotSupported() {

	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	var isOpera = (navigator.userAgent.indexOf("Opera") > -1 || navigator.userAgent.indexOf("OPR") > -1) ;
	if (isChrome === true && !isOpera) {
		if (location.protocol !== 'https:') {
			console.log('Hide geoLocation button because chrome does not support geoLocation if protocol is not https');
		} else {
			$('.hidden-if-not-https').removeClass('hidden-if-not-https'); // chrome and protocol is https so chrome supports	
		}
	} else {
		console.log('make location button visible');
		$('.hidden-if-not-https').removeClass('hidden-if-not-https');
	}
}
function init(){
	console.log('init()');
	console.log(geoLocation);
	$('#latitude').val(geoLocation.latitude);
	$('#longitude').val(geoLocation.longitude);


	hideMyLocationButtonIfNotSupported();
	$('#button-location').on('click tap', function(){
		getLocation();
	});
	$('#button-save').on('click tap', function(){
		saveLocation();
	});
}

$(function () {  
	init();//when script loads this runs.
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
});

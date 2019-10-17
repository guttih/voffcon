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
	hideMyLocationButtonIfNotSupported();
}

$(function () {  
	init();//when script loads this runs.
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
});

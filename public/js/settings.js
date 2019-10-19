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

function saveLocation(){

		var sendObj = {
						ssid : $('#ssid').val(),
						ssidPwd: $('#ssidPwd').val(),
						port : $('#port').val()
			};

			var posting = $.post( 'settings', sendObj);
		posting
			.done(function(data){
				console.log(data);
				var text = 'Server settings has been saved.  ';
				if (sendObj.port !== item.port.toString()){
					text+='\n\nNote that "port change" will only take place after restarting the server.';
				}
				showModal('Successfully saved', text);
			})
			.fail(function(data){
				console.log('Error saving ');
				console.log(data);
				showModalErrorText('Not saved', 'There was an error saving the server settings');
			});
}

function init(){
	$('#ssid')   .val(item.ssid);
	$('#ssidPwd').val(item.ssidPwd);
	$('#port')   .val(item.port);

	$('#button-save').on('click tap', function(){
		saveLocation();
	});
}

$(function () {  
	init();//when script loads this runs.
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
});

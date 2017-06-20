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
/*client javascript file for the list-device page*/
var SERVER;

function getUserDeviceList(){
	var url = SERVER+'/devices/device-list';
		var request = $.get(url);
	request.done(function( data ) {
		setDevicelistValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}

function setDevicelistValues(deviceList){
	var id, name, description, isOwner;
	for(var i = 0; i < deviceList.length; i++){
		id 		= deviceList[i].id;
		name 		= deviceList[i].name;
		description = deviceList[i].description;
		
		isOwner     = deviceList[i].isOwner;
		/*type = deviceList[i].type;
		  url  = deviceList[i].url;*/
		var str =  createListItem(id, name, description, 'devices', isOwner, isOwner, isOwner, isOwner);
		$("#device-list").append(str);
	}
}



$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	getUserDeviceList();
});

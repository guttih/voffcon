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

function getUserDeviceMonitorList(){
	var url = SERVER+'/triggeractions/device-list';
		var request = $.get(url);
	request.done(function( data ) {
		setDevicelistValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				console.err(data);
				showModal("You need to be logged in!", data.responseText);
			}
		});
}

/*Creates an item for a list which shows which devices have triggerActions and how many triggerActions*/
function createDevicesMonitorList(id, name, description, triggerActionRecordCount, routeText){
	var url = SERVER+'/'+ routeText +'/register/'+ id;
	var strElm = 
'<div id="listItem'+ id +'" class="list-group-item clearfix">' +
	'<p class="list-group-item-heading">' + name + '</p>' + 
	'<span class="list-group-item-text">' +description + '</span>'+
	'<span class="pull-right">';
	strElm +='<button onclick="deviceMonitors(\''+id+'\');" class="btn btn-xs btn-success"> <span class="glyphicon glyphicon-play"></span>&nbsp;Monitors('+ triggerActionRecordCount +') </button>';
	
	strElm +='</span>' +'</div>';

	return strElm; 
}

//opens the page for triggerActions for the the specified device.
function deviceMonitors(id){
	window.location.assign("device/"+id);
}

function setDevicelistValues(deviceList){
	var id, name, description, isOwner,recordCount;
	for(var i = 0; i < deviceList.length; i++){
		id 		= deviceList[i].id;
		name 		= deviceList[i].name;
		description = deviceList[i].description;
		
		isOwner     = deviceList[i].isOwner;
		recordCount = deviceList[i].recordCount;
		/*type = deviceList[i].type;
		  url  = deviceList[i].url;*/
		var str =  createDevicesMonitorList(id, name, description, recordCount, 'triggeractions');
		$("#device-list").append(str);
	}
}



$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	getUserDeviceMonitorList();
});

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
		
		var str =  createListItem(id, name, description, 'devices', false, isOwner, isOwner, isOwner);
		$("#device-list").append(str);
	}
}



$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	getUserDeviceList();
});
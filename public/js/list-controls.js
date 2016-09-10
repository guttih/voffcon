/*client javascript file for the list-control page*/
var SERVER;

function getUserControlList(){
	var url = SERVER+'/controls/control-list';
		var request = $.get(url);
	request.done(function( data ) {
		setControllistValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}

function setControllistValues(controlList){
	var id, name, description;
	for(var i = 0; i < controlList.length; i++){
		id 		= controlList[i].id;
		name 		= controlList[i].name;
		description = controlList[i].description;
		
		var str =  createListItem(id, name, description, 'controls', false, true, false, true);
		$("#control-list").append(str);
	}
}



$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	getUserControlList();
});
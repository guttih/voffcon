/*client javascript file for the list-control page*/
var SERVER;

function getUserControlList(){
	var url = SERVER+'/controls/control-list';
		var request = $.get(url);
	console.log('getUserControlList url : ' + url);
	request.done(function( data ) {
		console.log(data);
		setControllistValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}
function createListItem(name, description, url){
	var strElm;
	strElm =	'<a href="'+ url +'" class="list-group-item list-group-item-action">\n' + 
				'<h5 class="list-group-item-heading">' + name + '</h5>' +
				'<p class="list-group-item-text">'+ description +'.</p>' +
				"</a>";
	return strElm; 
}
function setControllistValues(controlList){
	var id, name, description;
	for(var i = 0; i < controlList.length; i++){
		shallDisable=false;
		console.log(controlList[i]);
		id 		= controlList[i].id;
		name 		= controlList[i].name;
		description = controlList[i].description;
		
		var str =  createListItem(name, description, SERVER+'/controls/register/'+ id);
		$("#control-list").append(str);
	}
}



$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	getUserControlList();
});
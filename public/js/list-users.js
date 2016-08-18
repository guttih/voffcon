/*client javascript file for the list-user page*/
var SERVER;

function getUserUserList(){
	var url = SERVER+'/users/user-list';
		var request = $.get(url);
	request.done(function( data ) {
		setUserlistValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}


function runItem(id){
	console.log('todo: run this item : ' + id);
}


function setUserlistValues(userList){
	var id, name, description;
	for(var i = 0; i < userList.length; i++){
		id 		= userList[i].id;
		name 		= userList[i].name;
		description = userList[i].description;
		
		var str =  createListItem(id, name, description, 'users', false);
		$("#user-list").append(str);
	}
}

$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	getUserUserList();
	
});
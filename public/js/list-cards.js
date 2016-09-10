/*client javascript file for the list-card page*/
var SERVER;

function getUserCardList(){
	var url = SERVER+'/cards/card-list';
		var request = $.get(url);
	request.done(function( data ) {
		setCardlistValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}


function runItem(id){
	console.log('todo: run this item : ' + id);
	window.location.assign("run/"+id);
	///cards/run/57b8441a160dd34c408131ba
}


function setCardlistValues(cardList){
	var id, name, description;
	for(var i = 0; i < cardList.length; i++){
		id 		= cardList[i].id;
		name 		= cardList[i].name;
		description = cardList[i].description;
		
		var str =  createListItem(id, name, description, 'cards', true, true, true, true);
		$("#card-list").append(str);
	}
}

$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	getUserCardList();
	
});
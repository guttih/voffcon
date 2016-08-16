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
function createListItem(name, description, url){
	var strElm;
	strElm =	'<a href="'+ url +'" class="list-group-item list-group-item-action">\n' + 
				'<h5 class="list-group-item-heading">' + name + '</h5>' +
				'<p class="list-group-item-text">'+ description +'.</p>' +
				"</a>";
	return strElm; 
}
function setCardlistValues(cardList){
	var id, name, description;
	for(var i = 0; i < cardList.length; i++){
		id 		= cardList[i].id;
		name 		= cardList[i].name;
		description = cardList[i].description;
		
		var str =  createListItem(name, description, SERVER+'/cards/register/'+ id);
		$("#card-list").append(str);
	}
}

$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	getUserCardList();
});
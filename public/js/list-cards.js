/*
        Ardos is a system for controlling devices and appliances from anywhere.
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


function setCardlistValues(cardList){
	var id, name, description, isOwner;
	for(var i = 0; i < cardList.length; i++){
		id          = cardList[i].id;
		name 		= cardList[i].name;
		description = cardList[i].description;
		isOwner     = cardList[i].isOwner;
		var str =  createListItem(id, name, description, 'cards', true, isOwner, isOwner, isOwner);
		$("#card-list").append(str);
	}
}

$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	getUserCardList();
	
});

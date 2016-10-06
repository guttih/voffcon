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
	var id, name, description, isOwner;
	for(var i = 0; i < controlList.length; i++){
		id 		= controlList[i].id;
		name 		= controlList[i].name;
		description = controlList[i].description;
		isOwner     = controlList[i].isOwner;
		
		var str =  createListItem(id, name, description, 'controls', false, isOwner, isOwner, isOwner);
		$("#control-list").append(str);
	}
}



$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	getUserControlList();
});

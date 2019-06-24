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

var encodeHTML = function encodeHTML(str) {
	if (str === undefined || str === null) {
		return str;
	}
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
};

function addEventsToTable() {
	
	if (events === undefined || events.length < 1){
		return;
	}

	//add fires after
	events.forEach(item => {
		var date = new Date(item.triggerTime);
		item.firesAfter = msToStr(date.getTime() - serverDate.getTime(), true);
	});


	var i;
	var $elm = $('#table-event thead');
	
	var keys = Object.keys(events[1]);
	
	//	adding header
	var keys2=['triggerTime','firesAfter','type', 'method','url', 'body','id','description']; 
	
	keys.forEach(element => {
		if (!keys2.includes(element))
		keys2.push(element);
	});
	var headers=[];
	keys2.forEach(element => {
		headers.push({title:element,text:element});
	});
	
	var row = '<tr>';
	for(i = 0; i<headers.length; i++){
		row+='<td rel="tooltip" title="'+ headers[i].title   +'">'+ headers[i].text + '</td>';
	}
	row+='</tr>';
	$elm.append(row);
	var itemList = events;
	//now add data
	$elm = $('#table-event tbody');
	console.log(itemList);
	var strType;
	for(i = 0; i<itemList.length; i++) {
		row='<tr class="trigger" id="'+itemList[i].id+'">';
		headers.forEach(item => {
			row+='<td>';
			if (item.text ==='id'){
				row+='<a href="'+SERVER+'/triggeractions/register/'+itemList[i].id+'">'+itemList[i].id+'</a>';
			} else {
				row+=encodeHTML(itemList[i][item.text]);
			}
			row+='</td>';
		});
		row+='</tr>';
		$elm.append(row);
	}
	$elm = $('#table-event tfoot');
	row='<tr>';
	row+='<td>Records</td>'
	row+='<td id="record-count" colspan="' + (headers.length) + '">'+itemList.length+'</td>';
	row+="</tr>";
	$elm.append(row);
		
}
function eventsToList() {
	console.log(events);
}



$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	addEventsToTable();

});

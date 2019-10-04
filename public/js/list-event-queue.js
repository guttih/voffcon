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
		item.firesAfter = msToStr(date.getTime() - serverDate.getTime(), false);
	});


	var i;
	var $elm = $('#table-event thead');
	
	//selecting properties to show
	var keys2   =['firesAfter',     'triggerTime','description',        'type', 'method']; 
	//setting header text
	var headers=['Time until event','Time when triggered','description','Type', 'Method'];
	var row = '<tr>';
	for(i = 0; i<headers.length; i++){
		row+='<td>'+ headers[i] + '</td>';
	}
	row+='</tr>';
	$elm.append(row);
	var itemList = events;
	//now add data
	$elm = $('#table-event tbody');
	for(i = 0; i<itemList.length; i++) {
		row='<tr class="trigger" id="'+itemList[i].id+'">';
			keys2.forEach(function(item, index){
				if (index === 0){
					row+='<td>';
					row+='<a class="time-until" title="Click to edit this trigger action" href="'+SERVER+'/triggeractions/register/'+itemList[i].id+'">'+itemList[i][item]+'</a>';
				} else {
					row+='<td class="item-property">';
					if (item === 'triggerTime') {
						row+=encodeHTML(formaTime(new Date(itemList[i][item])));
					} else {
						row+=encodeHTML(itemList[i][item]);
					}
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


//difference between page date and server date
var ServerDateDifferenceInMillis = 0;

function updateUntilTimers(){
	var pageTime =  new Date(new Date().getTime() + ServerDateDifferenceInMillis);
	$('#server-time.hidden').removeClass('hidden');
	$('#server-time').text(formaTime(pageTime));
	events.forEach(function(item){
		var date = new Date(item.triggerTime);
		if (date < pageTime) {
			location.reload();
		}
		item.firesAfter = msToStr(date.getTime() - pageTime.getTime(), false);
		var $elm = $('#' + item.id + ' a.time-until');
		$elm.text(item.firesAfter);
	});
}

$(function () {  
	var pageTime = new Date();
	ServerDateDifferenceInMillis = serverDate.getTime() - pageTime.getTime();
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	addEventsToTable();
	$('.item-property').click(function() {
		var id = $(this).parent().attr('id');
		var event = events.find(e => e.id === id);
		if (event !== undefined) {
			var message = '';
			var keys = Object.keys(events[0]);
			keys.forEach(element => {
				var text = encodeHTML(event[element]);
				if (element === 'id'){
					text = '<a title="Click to edit this trigger action" href="'+SERVER+'/triggeractions/register/'+event[element]+'">'+encodeHTML(event[element])+'</a>';
				}
				message+='<p><span style="display: inline-block;min-width: 100px;"><b>'+element+'</b>:</span>';
				message+=''+text+'</p>';
				
			});
			message+='\n';
			
			showModal('Event details', message);
		}
	});

	setInterval(function(){updateUntilTimers();}, 1000);
	

});


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

var SERVER;

function getDeviceLogs(clearOldValues){
	var url = SERVER+'/monitors/list/'+device.id;
		var request = $.get(url);
	request.done(function( data ) {
		setDeviceLogsToTable(data, clearOldValues);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}


function getPinIndexByName(strName, pins){
	for(var i = 0; i<pins.length; i++){
		if (strName === pins[i].name){
			return i;
		}
	}
	return -1;
}
function modeToTypeString(mode) {
	switch(mode){
		case 0: return "INPUT_ANALOG";
		case 1: return "INPUT_DIGITAL";
		case 2: return "OUTPUT_ANALOG";
		case 3: return "OUTPUT_DIGITAL";
	}
	return "?";
};

function pinsToTd(headers, pins){
	var index;
	var str = "";
	for(var i = 0; i<headers.length; i++) {
		index = getPinIndexByName(headers[i], pins);
		if (index > -1) {
			str+='<td class="pin-type-'+pins[index].m+'" rel="tooltip" title="Pin number: '+ pins[index].pin +' , pin type: '+ modeToTypeString(pins[index].m) +'">' + pins[index].val;
			str+='</td>';
		} else {
			str+='<td></td>';
		}
	}
	return str;
}

function monthToShortStr(month){
	switch(month){
		case 0: return "jan";
		case 1: return "feb";
		case 2: return "mar";
		case 3: return "apr";
		case 4: return "may";
		case 5: return "jun";
		case 6: return "jul";
		case 7: return "aug";
		case 8: return "sep";
		case 9: return "oct";
		case 10: return "nov";
		case 11: return "dec";
	}
	return "";
};

function addToTable(headers, monitors, clearOldValues){
	var i;
	var $elm = $('#table-monitor thead');
	if (clearOldValues !== undefined && clearOldValues === true) {
		$elm.empty();
		$('#table-monitor tbody').empty();
		$('#table-monitor tfoot').empty();
	}
	var row = '<tr>';
	
	//	adding header
	row+='<td>Time</td>';
	for(i = 0; i<headers.length; i++){
		row+='<td>'+ headers[i] + '</td>';
	}
	row+='</tr>';
	$elm.append(row);

	//now add data
	$elm = $('#table-monitor tbody');
	for(i = 0; i<monitors.length; i++){
		row='<tr id="'+ monitors[i].id +'">';
		row+='<td class="datetime-td">' + 
		' <a href="javascript:deleteLogItem(\''+ monitors[i].id +'\');"><span class="glyphicon glyphicon glyphicon-remove" rel="tooltip" title="Delete this monitor record" style="color:red" aria-hidden="true"></span></a>' +

		'<span>' +
		formaTima(new Date(monitors[i].datetime)); +'</span></td>';
		row+=pinsToTd(headers, monitors[i].pins);
		row+='</tr>';
		$elm.append(row);
	}
	$elm = $('#table-monitor tfoot');
	row='<tr>';
	row+='<td>Records</td>'
	row+='<td id="record-count" colspan="' + (headers.length) + '">'+monitors.length+'</td>';
	row+="</tr>";
	$elm.append(row);
	


}

function setDeviceLogsToTable(deviceLogs, clearOldValues){
	var monitors = [];
	var headers = [];
	for(var i = 0; i < deviceLogs.length; i++){
		monitors.push({
			id:deviceLogs[i]._id,
			datetime:deviceLogs[i].datetime,
			pins: JSON.parse(deviceLogs[i].data)
		});
		
		// add headers
		var head;
		for(var x = 0; x<monitors[i].pins.length; x++){
			head = monitors[i].pins[x].name;
			if (headers.indexOf(head) < 0){
				headers.push(head);
			}
		}
	};
	addToTable(headers, monitors, clearOldValues);
}

function deleteLogItem(monitorID){
	var sendObj = {
			"id":monitorID
		};

	var url = SERVER+'/monitors/'+monitorID;
		var deleting = $.delete( url, sendObj);

		deleting.done(function(data){
			if (data.id !== undefined) {
				$( "#"+data.id ).remove();
				var elCount = $("#record-count");
				var number =  Number(elCount.text());
				if (isNaN(number) || number < 1){
					number = 0;
				} else {
					number--;
				}
				elCount.text(number);
			}
		});
}

function openChartPage() {
	window.location.assign("linechart/"+device.id);
}

$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	getDeviceLogs();
	$.ajaxSetup({timeout:5000});
	$('button.btn-monitor-pins').click(function() {
		var url = SERVER+'/monitors/pins/'+device.id;
		var request = $.get(url);
		request.done(function( data ) {
			console.log(data);
			getDeviceLogs(true);
		}).fail(function( data ) {
			showModalErrorText("Logging error", "Unable to save device pin values to the monitor.");
		});
	});
	
	$('button.btn-delete-all-device-monitors').click(function() {
		
		showModalConfirm('Delete all records', 'Are you sure you want to delete all records in this monitor?', 'Delete', 
		function(){
			var request = $.delete( SERVER+'/monitors/list/'+device.id );
			request.done(function( data ) {
				getDeviceLogs(true);
			}).fail(function( data ) {
				showModalErrorText("Delete error", "Unable to delete all device records monitors from this monitor.");
			});
		}
	);




		
		
		
		
	










	});

});

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
	var url = SERVER+'/triggeractions/listall';
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


encodeHTML = function encodeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
  };

function setDeviceLogsToTable(itemList, clearOldValues){
	
	var i;
	var $elm = $('#table-triggerAction thead');
	if (clearOldValues !== undefined && clearOldValues === true) {
		$elm.empty();
		$('#table-triggerAction tbody').empty();
		$('#table-triggerAction tfoot').empty();
	}
	var row = '<tr>';
	
	//	adding header
	var headers=[ 	{title:'description'         ,text:'Description'},
					{title:'Device'			     ,text:'Device'},
					{title:'Destination device'	 ,text:'Destination device'}, 
					{title:'Http method'	     ,text:'Method'},
					{title:'date'	             ,text:'Date'},
					{title:'delete'                   ,text:''}];
	
	row+='<td>Type</td>';
	for(i = 0; i<headers.length; i++){
		row+='<td rel="tooltip" title="'+ headers[i].title   +'">'+ headers[i].text + '</td>';
	}
	row+='</tr>';
	$elm.append(row);
	
	//now add data
	$elm = $('#table-triggerAction tbody');
	console.log(itemList);
	var strType;
	for(i = 0; i<itemList.length; i++){
		strType =  itemList[i].type;
		row='<tr id="'+ itemList[i]._id +'">';
		row+='<td class="datetime-td">';
		row+=' <a href="javascript:window.location.href =\'/triggeractions/register/'+ itemList[i]._id + '\'">&nbsp;<span class="glyphicon glyphicon glyphicon-pencil" rel="tooltip" title="Modify this trigger action" style="color:black" aria-hidden="true"></span>&nbsp;</a>';
		row+='<span>' + strType +'</span></td>';
		row+='<td rel="tooltip" title="'+ itemList[i].description +'">' + itemList[i].description + '</td>';
		row+='<td rel="tooltip" title="'+ itemList[i].deviceId   +'">' + itemList[i].deviceName + '</td>';
		row+='<td rel="tooltip" title="'+ itemList[i].destDeviceId   +'">' + itemList[i].destDeviceName + '</td>';
		//row+='<td rel="tooltip" title="Url">' + encodeHTML(itemList[i].url) + '</td>';
		row+='<td rel="tooltip" title="'+ itemList[i].method   +'">' + itemList[i].method + '</td>';
		row+='<td  style="min-width:160px" rel="tooltip" title="'+ itemList[i].date   +'">' + formaTime(new Date(itemList[i].date)) + '</td>';
		row+='<td> <a href="javascript:deleteListItem(\'triggeractions\',\''+ itemList[i]._id +'\');"><span class="glyphicon glyphicon glyphicon-remove" rel="tooltip" title="Delete this trigger action" style="color:red" aria-hidden="true"></span></a></td>';
		row+='</tr>';
		$elm.append(row);
	}
	$elm = $('#table-triggerAction tfoot');
	row='<tr>';
	row+='<td>Records</td>'
	row+='<td id="record-count" colspan="' + (headers.length) + '">'+itemList.length+'</td>';
	row+="</tr>";
	$elm.append(row);
		
	
	
	
}

function deleteListItem(route,itemId){
	var sendObj = {
			"id":itemId
		};

	var url = SERVER+'/'+route+'/'+itemId;
		var deleting = $.delete( url, sendObj);
		deleting.done(function( data ) {
			window.location.assign('list-all');
		}).fail(function( data ) {
			window.location.assign('list-all');
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
	
	$('button.btn-delete-all-device-itemList').click(function() {
		
		showModalConfirm('Delete all records', 'Are you sure you want to delete all records in this trigger action?', 'Delete', 
		function(){
			var request = $.delete( SERVER+'/itemList/list/'+device.id );
			request.done(function( data ) {
				getDeviceLogs(true);
			}).fail(function( data ) {
				showModalErrorText("Delete error", "Unable to delete all device records itemList from this trigger action.");
			});
		}
	);




		
		
		
		
	










	});

});

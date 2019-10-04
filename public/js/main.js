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
//var SERVERURL = 'http://192.168.1.151:5100'; /*make a direct call bypassing sequrity for local clients*/
var CONFIG = {};
var SERVER = "";
// www.guttih.com ip 89.17.157.231

//appending put and delete to the jquery send
jQuery.each( [ "put", "delete" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});

function setStartTime(date) {
		//var date = data.date;
		deviceStarted = new Date(date.year, date.month-1, date.day, date.hours, date.minutes, date.seconds, 0);
		var strDate = formaTima(deviceStarted);
		$('#server-started').text(strDate);
		
		$elm.text("Successfully connected to the device.").removeClass("alert-warning").addClass("alert-success");
}


function logger(str){
	console.log("Logger : "+ str);
}

$('#btnSetStarted').click(function() {
	getWhenServerStarted();
});
$('#btnGetDevices').click(function() {
	getUserDeviceList();
});

var serverStartedTime;

//adds '0' in front of all numbers smaller than 10
function zeroFirst(number){
	return (number < 10) ? '0'+number : number;
}

function formaTima(d) {
var str =  d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear() + " " +
			zeroFirst(d.getHours()) + ":" + zeroFirst(d.getMinutes()) + ":" + zeroFirst(d.getSeconds());

return str;
}

function formaTime(d) {
	var str =  d.getFullYear() + "-" + zeroFirst(d.getMonth()+1) +"-"+ zeroFirst(d.getDate()) + " " +
				zeroFirst(d.getHours()) + ":" + zeroFirst(d.getMinutes()) + ":" + zeroFirst(d.getSeconds());
	
	return str;
	}

/*
leadingZeros(10, 4);      // 0010
leadingZeros(9, 4);       // 0009
leadingZeros(123, 4);     // 0123
leadingZeros(10, 4, '-'); // --10*/
function leadingZeros(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

function msToStr(durationInMillis, showMilliseconds) {
	var milliseconds = parseInt((durationInMillis%1000)/1), 
		seconds = parseInt((durationInMillis/1000)%60),
		minutes = parseInt((durationInMillis/(1000*60))%60), 
		hours   = parseInt((durationInMillis/(1000*60*60))%24),
		days    = parseInt((durationInMillis/(1000*60*60*24)));
	if (durationInMillis < 60000) {
		//fixing precision problem
		days=hours=minutes=0;
	}

	days         = leadingZeros(days, 2);
	hours        = leadingZeros(hours, 2);
	minutes      = leadingZeros(minutes, 2);
	seconds      = leadingZeros(seconds, 2);
	milliseconds = leadingZeros(milliseconds, 3);
	
	var str = "";
	str = days + "d:" + hours + "h:" + minutes + "m:" + seconds + "s";
	if (showMilliseconds !== undefined && showMilliseconds === true){
		str+= ':'+milliseconds + "ms";
	}
	return str;
}

function updateServerRunningtime(){
	var now = new Date(); //"now"
	var diff = Math.abs(now - serverStartedTime);
	$('#serverRunning').text(msToStr(diff));
}
function setServerStartedValue(date){
	console.log("date");
	console.log(date);
	serverStartedTime = new Date(date.year, date.month-1, date.day, date.hours, date.minutes, date.seconds, 0);
	
	$('#serverStarted').text(formaTima(serverStartedTime));
	updateServerRunningtime();
	
}


function getUserDeviceList(){
	var url = SERVER+'/devices/device-list';
		var request = $.get(url);
	request.done(function( data ) {
		// Put the results in a div
		console.log(data);
		setDevicelistValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}
/**
 * Returns them number of days in a specified month
 * @param {Integer} year
 * @param {Integer} month 1-indexed months, where 1 is january and 12 is december
 */
function numberOfDaysInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}
function getWhenServerStarted(){
	var url = SERVER+'/devices/started';
	var selected = $( "#devicelist" ).val();
	if (selected===undefined){
		console.log("NOTHING selected");
		return;
	}
	selected = JSON.parse(selected);
	console.log("selected");
	console.log(selected);
		var request = $.get(SERVER+'/devices/started/'+selected.id);
		
	request.done(function( data ) {
		// Put the results in a div
		setServerStartedValue(data.date);
	}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}


/*routeText is the element type to be deleted 'cards', 'controls' or 'devices'*/
function createListItem(id, name, description, routeText, bAddRunButton, bAddAccessButton, bAddEditButton, bAddDeleteButton){
	var url = SERVER+'/'+ routeText +'/register/'+ id;
	var strElm = 
'<div id="listItem'+ id +'" class="list-group-item clearfix">' +
	'<p class="list-group-item-heading">' + name + '</p>' + 
	'<span class="list-group-item-text">' +description + '</span>'+
	'<span class="pull-right">';
	//window.location.href = '/cards/useraccess/'+ card.id;
	if (bAddRunButton){
		strElm +='<button onclick="runItem(\''+id+'\');" class="btn btn-xs btn-success"> <span class="glyphicon glyphicon-play"></span>&nbsp;Run </button>';
	}
	if (bAddAccessButton){
		strElm += '<a href="/'+ routeText +'/useraccess/'+ id +'" class="btn btn-xs btn-warning"> <span class="glyphicon glyphicon-user"></span>&nbsp;Access </a>';
	}
	if (bAddEditButton){
		strElm += '<a href="'+ url +'" class="btn btn-xs btn-warning"> <span class="glyphicon glyphicon-edit"></span>&nbsp;Edit </a>';
	}

	if (bAddDeleteButton){
	 strElm +='<button onclick="deleteItem(\''+ routeText +'\', \''+id+'\');" class="btn btn-xs btn-danger"> <span class="glyphicon glyphicon-trash"></span> Delete </button>';
	}
	strElm +='</span>' +'</div>';

	return strElm; 
}

function createListItemUserAccess(id, name, description, routeText, selectedOption, includeOption1){
	var url = SERVER+'/'+ routeText +'/register/'+ id;
	var sel0, sel1, sel2;
	sel0 = (selectedOption === 0) ? ' selected' : '';
	sel1 = (selectedOption === 1) ? ' selected' : '';
	sel2 = (selectedOption === 2) ? ' selected' : '';
	var strElm = 
'<div id="' + id +'" class="list-group-item clearfix">' +
	'<p class="list-group-item-heading">' + name + '</p>' + 
	'<span class="list-group-item-text">' +description + '</span>'+
	'<span class="pull-right">';
	strElm+='<select class="access-select form-control">'+
  				'<option value="0"' + sel0 + '>No access</option>';
	if (includeOption1 === true){
		strElm+=    '<option value="1"' + sel1 + '>User</option>';
	}
	strElm+=	'<option value="2"' + sel2 + '>Owner</option>'	+
			'</select>';
	strElm +='</span>' +'</div>';

	return strElm; 
}

// changes the background color of a select box which handles user access to items
function setSelectAccessBackgroundClick(){
	var $elm = $('.access-select');
	$elm.on('change', function() {
		var color = 'white';

		switch(this.value){
			case "1" : color = '#F0F7ED'; break;
			case "2" : color = '#A1D490'; break;
		}
		$(this).css("background-color", color);
	});

	// run the onChange
	$elm.each(function( index ) {
  		$( this ).trigger("change");
	});
}



/*routeText is the element type to be deleted 'cards', 'controls' or 'devices'*/
function deleteItem(routeText, id){
	var singular;
	singular = routeText.substring(0, routeText.length-1);
	//showModal('Delete item',	'Are you sure you want to delete this '+ routeText +'?');
	
	showModalConfirm('Delete ' + singular,	
		'Are you sure you want to delete this '+ singular +'?',
		'Delete', 
		function(){
			var url = SERVER+'/'+ routeText +'/'+id;
			$.ajax({
				url: url,
				type: 'DELETE',
				success: function(data) {
					console.log("delete responce.");
					console.log(data);
					console.log('todo: onDeleted remove this item from the dom list' );
					
					$('#listItem'+ id).remove();
				},
				error: function (res){
					console.log(res);
					showModal('Error when deleting',	
							res.responseText + '   (' + res.status + ': ' + res.statusText+')');
				}
			});
		
		}
	);
		
}
function showModalError(title, responce){

	showModal(title, 
			'Error ' + responce.status + ' : ' + responce.statusText + 
			'\n\n<p class="error-response-text">' + responce.responseText + '</p>');
}
function showModalErrorText(title, errorMessage){

	showModal(title, 
			'Error ' + 
			'\n\n<p class="error-response-text">' + errorMessage + '</p>');
}
function showModal(title, message){
	$(".modal-title").text(title);
	if (message.indexOf('\n')>-1)
	{
		message = message.replace(/\n/g, '<br/>');
		$(".modal-body").html(message);
	}
	else {
		$(".modal-body").text(message);
	}
	$('#btn-confirm').hide(); 
	$('#myModal').modal('show');
	
}


function showModalConfirm(title, message, confirmButtonText, callback){
	$(".modal-title").text(title);
	$(".modal-body").text(message); 
	if (callback === undefined){
		//no button text provided
		$('#btn-confirm').text("Confirm");
		callback = confirmButtonText; /**/

	} else {
		$('#btn-confirm').text(confirmButtonText);
	}
	$('#btn-confirm').on('click', function(e) {
		callback();
		$('#myModal').modal('hide');
	});
	$('#btn-confirm').show();
	$('#myModal').modal('show');
}

function changeHref(from, to){
	window.location.href = window.location.href.replace(from,to);
}

function getServer(){
	if (window.location.protocol === 'file:')
	{	//todo: remove dummy
		return 'http://www.guttih.com:6100';
	}
	return window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
}


function getServerUrl(){
	var serverUrl = window.location.protocol + '//' + window.location.hostname +(window.location.port ? ':'+window.location.port: '');
	return serverUrl;
}

/*function getUserUserList(callback){
	var url = SERVER+'/users/user-list';
		var request = $.get(url);
	request.done(function( data ) {
		callback(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}*/

function changeUsersCanRegister(){
	var $elm = $('#allow-user-registration');
	var checked = $elm.hasClass( "checked" );
	var allow = true;  
	if (checked === true){
		allow = false; //checked was, and is  true, so we are denying access
	}
	var sendObj = {};
	sendObj.allowUserRegistration = allow;
	//var posting = $.post( '/users/settings', sendObj);
	var posting = $.post( '/settings', sendObj);
	posting
		.done(function(data){
			//successful update let's change the class "checked"
			if (allow === true) {//successfully able to ALLOW users to register 
				$elm.addClass("checked");
			} else { //successfully able to DENY users to register 
				$elm.removeClass("checked");
			}
		})
		.fail(function(data){
			console.log("failed posting");
			console.log(data);
			showModalError('Error updating settings for user registration', data);
		});
	
	//window.location.href = asdf
}

function getUserUserList(callback){
	var url = '/users/user-list';
	requestData(url, callback);
}


// makes a call to the API requesting data
// the subUrl should not contain the protocol, hostname nor port number
function requestData(subUrl, callback, errorCallback){
		var url = SERVER + subUrl;
		var request = $.get(url);
	request.done(function( data ) {
		callback(data);
		}).fail(function( data ) {
			if (errorCallback !== undefined){
				errorCallback(data);
			} else {
				if (data.status===401){
					showModal("You need to be logged in!", data.responseText);
				}
			}
		});
}
/*
function changeHref(caller, id){
	console.log(caller);
	var newValue = caller.value;
	var $elm = $("#"+id);
	if ( $elm.length < 1 ) { 
		return;
	}
	$elm.attr({href: newValue});
}*/

function runItem(id){
	window.location.assign("run/"+id);
}

function changeHref(from, to){
	window.location.href = window.location.href.replace(from,to);
}

function changeHelpHref(caller, id){
	var newValue = caller.value;
	var $elm = $("#"+id);
	if ( $elm.length < 1 ) { 
		return;
	}
	$elm.attr({href: newValue});
}



$(function () {  
	/* this is the $( document ).ready(function( $ ) but jshint does not like that*/
	var SERVER = getServer();
	//todo: run this only if logged in getWhenServerStarted();
	$('.dropdown-toggle').dropdown();/*for the dropdown-toggle bootstrap class*/
	$("[rel='tooltip']").tooltip();/*activate boostrap tooltips*/

});

//var SERVERURL = 'http://192.168.1.151:5100'; /*make a direct call bypassing sequrity for local clients*/
var CONFIG = {};
var SERVER = "";
// www.guttih.com ip 89.17.157.231


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

function formaTima(d) {
var str =  d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear() + " " +
			d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

return str;
}

function msToStr(duration) {
	var milliseconds = parseInt((duration%1000)/100), 
		seconds = parseInt((duration/1000)%60),
		minutes = parseInt((duration/(1000*60))%60), 
		hours   = parseInt((duration/(1000*60*60))%24),
		days    = parseInt((duration/(1000*60*60*24)));

	days   = (days   < 10) ? "0" + days : days;
	hours   = (hours   < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
	var str = "";
	if (days > 0) {str+=days+" days ";}
	if (hours > 0) {str+=hours+" hrs ";}
	if (minutes > 0) {str+=minutes+" min ";}
	str+=seconds+" sec";
	return days + "d:" + hours + "h:" + minutes + "m:" + seconds + "s";
	//return str;
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
	var url = SERVER+'/devices/list';
		var request = $.get(url);
	request.done(function( data ) {
		// Put the results in a div
		setDevicelistValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}

function setDevicelistValues(devicelist){
	var key, name, shallDisable = true;
	$("#devicelist").empty().prop( "disabled", true );
	for(var i = 0; i < devicelist.length; i++){
		shallDisable=false;
		console.log(devicelist[i]);
		
		key = devicelist[i].id;
		name = devicelist[i].name;
		$('#devicelist')
			.append($('<option>', { value : JSON.stringify(devicelist[i])})
			.text(name));
	}
	$('#devicelist').prop( "disabled", shallDisable );
	$("#devicelist option").each(function(item){
			console.log(item);
		// Add $(this).val() to your list
	});
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
function createListItem(id, name, description, routeText, bAddAccessButton, bAddEditButton, bAddRunButton, bAddDeleteButton){
	var url = SERVER+'/'+ routeText +'/register/'+ id;
	var strElm = 
'<div id="listItem'+ id +'" class="list-group-item clearfix">' +
	'<p class="list-group-item-heading">' + name + '</p>' + 
	'<span class="list-group-item-text">' +description + '</span>'+
	'<span class="pull-right">';
	//window.location.href = '/cards/useraccess/'+ card.id;
	if (bAddAccessButton){
		strElm += '<a href="/cards/useraccess/'+ id +'" class="btn btn-xs btn-warning"> <span class="glyphicon glyphicon-user"></span>&nbsp;Access </a>';
	}
	if (bAddEditButton){
		strElm += '<a href="'+ url +'" class="btn btn-xs btn-warning"> <span class="glyphicon glyphicon-edit"></span>&nbsp;Edit </a>';
	}
	if (bAddRunButton){
		strElm +='<button onclick="runItem(\''+id+'\');" class="btn btn-xs btn-success"> <span class="glyphicon glyphicon-play"></span>&nbsp;Run </button>';
	}
	if (bAddDeleteButton){
	 strElm +='<button onclick="deleteItem(\''+ routeText +'\', \''+id+'\');" class="btn btn-xs btn-danger"> <span class="glyphicon glyphicon-trash"></span> Delete </button>' 
	}
	strElm +='</span>' +'</div>';

	return strElm; 
}

function createListItemUserAccess(id, name, description, routeText, selectedOption){
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
  				'<option value="0"' + sel0 + '>No access</option>' 	+
  				'<option value="1"' + sel1 + '>User</option>'		+
  				'<option value="2"' + sel2 + '>Owner</option>'	+
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
		
		});
		
}
function showModalError(title, responce){

	showModal(title, 
			'Error ' + responce.status + ' : ' + responce.statusText + 
			'\n\n<p class="error-response-text">' + responce.responseText + '</p>');
	
}
function showModal(title, message){
	$(".modal-title").text(title);
	if (message.indexOf('\n')>-1)
	{
		message = message.replace('\n', '<br/>');
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
	console.log("Changing href from \""+ from +"\" to \""+ to+"\"." );
	window.location.href = window.location.href.replace(from,to);
}

function getServer(){
	console.log("window.location.protocol");
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

function getUserUserList(callback){
	var url = '/users/user-list';
	requestData(url, callback);
}


// makes a call to the API requesting data
// the subUrl should not contain the protocol, hostname nor port number
function requestData(subUrl, callback){
		var url = SERVER + subUrl;
		var request = $.get(url);
	request.done(function( data ) {
		callback(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}





$(function () {  
	/* this is the $( document ).ready(function( $ ) but jshint does not like that*/
	var SERVER = getServer();
	//todo: run this only if logged in getWhenServerStarted();
	$('.dropdown-toggle').dropdown();/*for the dropdown-toggle bootstrap class*/
	$("[rel='tooltip']").tooltip();/*activate boostrap tooltips*/

});

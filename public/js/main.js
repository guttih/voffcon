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
function createListItem(id, name, description, routeText, bAddRunButton){
	var url = SERVER+'/'+ routeText +'/register/'+ id;
	var strElm = 
'<div id="listItem'+ id +'" class="list-group-item clearfix">' +
	'<h5 class="list-group-item-heading">' + name + '</h5>' +
	description +
	'<span class="pull-right">' +
	'<a href="'+ url +'" class="btn btn-xs btn-success"> <span class="glyphicon glyphicon-edit"></span>&nbsp;Edit </a>';
	if (bAddRunButton){
		strElm +='<button onclick="runItem(\''+id+'\');" class="btn btn-xs btn-success"> <span class="glyphicon glyphicon-play"></span>&nbsp;Run </button>';
	}
	 strElm +='<button onclick="deleteItem(\''+ routeText +'\', \''+id+'\');" class="btn btn-xs btn-danger"> <span class="glyphicon glyphicon-trash"></span> Delete </button>' +
	'</span>' +'</div>';

	return strElm; 
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
		
	/*var url = SERVER+'/'+ routeText +'/'+id;
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
	});*/
}
function showModal(title, message){
	$(".modal-title").text(title);
	$(".modal-body").text(message);
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


$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	var SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	//todo: run this only if logged in getWhenServerStarted();
	$('.dropdown-toggle').dropdown();/*for the dropdown-toggle bootstrap class*/
	$("[rel='tooltip']").tooltip();/*activate boostrap tooltips*/

});

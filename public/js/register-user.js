var	SERVER,
	checkTimer;


function updateEditState(text, buttonID){
	if ( text === undefined || text === ""){
			$('#' + buttonID).prop('disabled', true);
		}
		else{
			updateSaveButtonState(buttonID);
		}
}

function saveUser(){

	
	
	

	var sendObj = {
			id			: $('#id').val(),
			name		: $('#name').val(),
			username	: $('#username').val(),
			email		: $('#email').val(),
			password	: $('#password').val()
		};
	
	console.log('document.getElementById("user-form").submit();');

}
function registerUserInput($el){
	var buttonID = 'btnSaveUser';
	$el
		.keyup(function() {  updateEditState($.trim($(this).val()), buttonID);  })
		.change(function(){  updateEditState($.trim($(this).val()), buttonID);	});
}
function init(){
	var buttonID = 'btnSaveUser';

	$('#btnSaveUser').click(function() {
		saveUser();
	});
	
	//registering change events from user input
	/*$('#name')
		.keyup(function() {  updateEditState($.trim($(this).val()), buttonID);  })
		.change(function(){  updateEditState($.trim($(this).val()), buttonID);	});*/
		registerUserInput($('#name'));
		registerUserInput($('#username'));
		registerUserInput($('#email'));
		registerUserInput($('#password'));
		registerUserInput($('#password2'));
}


//enables the save button if all requered values are ok.
function updateSaveButtonState(buttonID){
	clearTimeout(checkTimer);
	checkTimer=setTimeout(function(){
		updateSaveButtonStateHelper(buttonID);
	}, 300);
}

function updateSaveButtonStateHelper(buttonID){
		
	var selectBtn = '#'+buttonID;
	if ($("#name").val()      === ""){ $(selectBtn).prop('disabled', true);  return;	}
	if ($("#username").val()  === ""){ $(selectBtn).prop('disabled', true);  return;	}
	if ($("#email").val()     === ""){ $(selectBtn).prop('disabled', true);  return;	}
	if ($("#password").val()  === ""){  $(selectBtn).prop('disabled', true);  return;	}
	if ($("#password2").val() === ""){  $(selectBtn).prop('disabled', true);  return;	}
	
	$(selectBtn).prop('disabled', false);
}

function setUserValues(item){
	$('#id').val(item.id);
	$('#name').val(item.name);
	$('#username').val(item.username);
	$('#email').val(item.email);
}

function getUser(id){
	var url = SERVER+'/users/item/'+id;
		var request = $.get(url);
	request.done(function( data ) {
		setUserValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
			else if (data.status===404){
				showModal("Not found!", data.responseText);
			}
		});
}

$(function () {  
	init();//when script loads this runs.
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	
	var user    = $( '#item' ).data('user');
	
	if (user !== undefined){ getUser(user.id);	}

});
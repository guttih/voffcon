var	SERVER,
	checkTimer;

function updateEditState(id, text, buttonID){
	if ( text === undefined || text === ""){
		if ( isEditMode() && (id === 'password' ||id === 'password2') ){
				//we are in edit mode then the passwords just need to match
				//todo: simplify these ifs
			var passwordsDoNotMatch = ( $('#password').val() !== $('#password2').val() );
			if (passwordsDoNotMatch){
				setSaveButtonState(buttonID, passwordsDoNotMatch, "passwords do not match");
			} else{ 
				updateSaveButtonState(buttonID);
			}
		}
		else {
			setSaveButtonState(buttonID, true, id + " is missing!");
		}
	} else {
		updateSaveButtonState(buttonID);
	}
}

//returns true if we are in edit mode otherwise false;
function isEditMode(){
	if ($( '#item' ).data( 'user' ) !== undefined){ 
		return true;
	}
	return false;
}

function saveUser(){
	var user = $( '#item' ).data( 'user' );
	if (user !== undefined){ /*we are in editmode*/
		document.getElementById('id').value = user.id;
		//this triggers post route on server "users/register/:userID"
	}
	/*var sendObj = {
			id			: $('#id').val(),
			name		: $('#name').val(),
			username	: $('#username').val(),
			email		: $('#email').val(),
			password	: $('#password').val(),
			password2	: $('#password2').val()
		};*/
	var isPowerUser = $("#div-level").is(":visible");
	if (!isPowerUser){
		$('#contactsForm').attr('action', "users/profile").submit();
	}
	document.getElementById("user-form").submit();
}
function registerUserInput($el){
	var buttonID = 'btnSaveUser';
	$el
		.keyup(function() {  updateEditState(this.id, $.trim($(this).val()), buttonID);  })
		.change(function(){  updateEditState(this.id, $.trim($(this).val()), buttonID);	});
}
function init(){
	var buttonID = 'btnSaveUser';

	$('#btnSaveUser').click(function() {
		saveUser();
	});
	$("#div-level").hide();
	
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

function setSaveButtonState(buttonID, shallDisable, strResonForDisabling){
	$( '#'+buttonID).prop('disabled', shallDisable);
	if (shallDisable){
		
		$( '#error-text > span').text(strResonForDisabling);
		$( '#error-text').show();
	} else{
		$( '#error-text').hide();
	}
	
}

function updateSaveButtonStateHelper(buttonID){
	setSaveButtonState(buttonID, true, "strResonForDisabling");
	var selectBtn = '#'+buttonID;
	if ($("#name").val()      === ""){         setSaveButtonState(buttonID, true, "name is missing");  return;	}
	if ($("#username").val()  === ""){         setSaveButtonState(buttonID, true, "username is missing");  return;	}
	if ($("#email").val()     === ""){         setSaveButtonState(buttonID, true, "email is missing");   return;	}
	if (!isEditMode()){
		if ($("#password").val()  === ""){     setSaveButtonState(buttonID, true, "password is missing");   return;	}
		if ($("#password2").val()     === ""){ setSaveButtonState(buttonID, true, "confirm password is missing");   return;	}
	}
	var passwordsDoNotMatch = ( $('#password').val() !== $('#password2').val() );
	

	setSaveButtonState(buttonID, passwordsDoNotMatch, "passwords do not match");
	
	
}

function setUserValues(item){
	$('#id').val(item.id);
	$('#name').val(item.name);
	$('#username').val(item.username);
	$('#email').val(item.email);
	$("#level").val(item.level);
	if (item.currentUserLevel > 1){
		$("#div-level").show();
	} else {
		$("#div-level").hide();
	}
	//this triggers post route on server "users/register/:userID"
	document.getElementById('id').value = item.id;
		
	
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
	updateSaveButtonState('btnSaveUser');
});
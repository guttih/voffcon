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
var	SERVER,
	editJsCtrl,
	editJsCard,
	editHtmlCtrl,
	checkTimer,
	buttonID;

function initEditor(editorId, mode, theme, strValue){
	//https://ace.c9.io/build/kitchen-sink.html
	// https://github.com/ajaxorg/ace/wiki/Configuring-Ace
if (document.getElementById(editorId) === null){ return;}
var edi = ace.edit(editorId);
	if (edi === undefined){
		return;
	}
	edi.$blockScrolling = Infinity;
	if (theme !== null){
		edi.setTheme("ace/theme/" + theme);
	}
	if (mode !== null){
		edi.getSession().setMode("ace/mode/" +  mode);
	}
	if (strValue !== undefined){
		
		edi.setValue(strValue, -1);
	}
	return edi;
}
function initEditorText(editorId, strText){
	var ed = initEditor('editor-desc', null, null, strText);
	if (ed === undefined) {return;}
	ed.renderer.setOption('showGutter', false);
	ed.setOptions({
		highlightActiveLine	: false,
		showPrintMargin		: false
	});
}
function updateEditState(text, buttonID){
	if ( text === undefined || text === ""){
			$('#' + buttonID).prop('disabled', true);
		}
		else{
			updateSaveButtonState(buttonID);
		}
}
function saveControl(){

	var controlID = $( '#item' ).data( 'control' );
	if (controlID !== undefined){
		document.getElementById('id').value = controlID.id;
	}
	
	var strCode = editJsCtrl.getValue();
		var strHtml = editHtmlCtrl.getValue();
		var strName = $('#name').val();
		var strDesc = $('#description').val();
		var strHelp = $('#helpurl').val();
		 var sendObj = {
			 name			: strName,
			 description	: strDesc,
			 helpurl        : strHelp,
			 template		: strHtml,
			  code			: strCode
		 };
		 $('#code').val(strCode);
		 $('#template').val(strHtml);
		 document.getElementById("template").value = strHtml;

		var control    = $( '#item' ).data('control');
		if (control !==undefined && control.id !==undefined && control.id.length > 0 && !$('#close-on-save').is(":checked")) {
			console.log("valid control and, not checked");
			var posting = $.post( 'no-close/'+control.id, sendObj);
			posting
				.done(function(data){
					console.log(data);
					showModal("Control saved", "Your control has been saved.");
				})
				.fail(function(data){
					console.log("failed saving control");
					console.log(data);
					showModalError('Error saving your control', data);
				});

		} else {
			 document.getElementById('control-form').submit();
		}

}
function saveCard(){

	var strCode = editJsCard.getValue();
	var strName = $('#name').val();
	var strDesc = $('#description').val();
	var strHelp = $('#helpurl').val();
	var sendObj = {
			name		: strName,
			description	: strDesc,
			helpurl     : strHelp,
			code		: strCode
		};
	$('#code').val(strCode);

	var card = $( '#item' ).data('card');

	if (card !==undefined && card.id !==undefined && card.id.length > 0 && !$('#close-on-save').is(":checked")) {
		console.log("valid card and, not checked");
		///register-no-close/:cardID
		
		var posting = $.post( 'no-close/'+card.id, sendObj);
	posting
		.done(function(data){
			console.log(data);
			showModal("Card saved", "Your card has been saved.");
		})
		.fail(function(data){
			console.log("failed saving card");
			console.log(data);
			showModalError('Error saving your card', data);
		});
	} else {
		document.getElementById('card-form').submit();
	}

}

function aceInit(){
	editJsCtrl = initEditor(  'editor-js-ctrl',   'javascript', 'monokai');
	editJsCard = initEditor(  'editor-js-card',   'javascript', 'monokai');
	editHtmlCtrl = initEditor('editor-html-ctrl', 'html',       'chaos');
	buttonID = 'btnSaveControl';

	$('#btnSaveControl').click(function() {
		saveControl();
	});
	$('#btnSaveCard').click(function() {
		saveCard();
	});
	if (editJsCard !== undefined){
		buttonID = 'btnSaveCard';
	}
	
	//registering change events from user input
	$('#name')
		.keyup(function() {  updateEditState($.trim($(this).val()), buttonID);  })
		.change(function(){  updateEditState($.trim($(this).val()), buttonID);	});
	$('#description')
		.keyup(function() {  updateEditState($.trim($(this).val()), buttonID);	})
		.change(function(){  updateEditState($.trim($(this).val()), buttonID);	});
	
	if (editHtmlCtrl !== undefined){
		editHtmlCtrl.getSession().on('change', function() {
			updateEditState(editHtmlCtrl.getValue(), buttonID);
		});
		editHtmlCtrl.getSession().on('changeAnnotation', function() {
			updateEditState(editHtmlCtrl.getValue(), buttonID);
		});
	}

	if (editJsCtrl !== undefined){
		var session = editJsCtrl.getSession();
		session.on('change', function() {
			
			updateEditState(editJsCtrl.getValue(), buttonID);
		});
		session.on('changeAnnotation', function() {
			updateEditState(editJsCtrl.getValue(), buttonID);
		});

		session.on("changeAnnotation", function() {
			var annotations = session.getAnnotations()||[];
			var lenBefore = annotations.length;
			if (removeKnownAnnotations(editJsCtrl.getValue(), annotations) < lenBefore){
				session.setAnnotations(annotations);
			}
		});
	}
	if (editJsCard !== undefined){
		var xsession = editJsCard.getSession();
		xsession.on('change', function() {
			
			updateEditState(editJsCard.getValue(), buttonID);
		});
		xsession.on('changeAnnotation', function() {
			updateEditState(editJsCard.getValue(), buttonID);
		});

		xsession.on("changeAnnotation", function() {
			var annotations = xsession.getAnnotations()||[];
			var lenBefore = annotations.length;
			if (removeKnownAnnotations(editJsCard.getValue(), annotations) < lenBefore){
				xsession.setAnnotations(annotations);
			}
		});
	}
}

function test(str){
	var obj = extractUsingArray(str);
	console.log("obj");
	console.log(obj);
}
// returns a string array of the using statment
function extractUsingArray(strCode){
	var line = strCode.replace(/\s\s+/g, ' ');
	var iStart, iStop;
	iStart = line.indexOf('var using =');
	if (iStart > -1) {iStart +=11; }
	else {
		iStart = line.indexOf('var using=');
		if (iStart === -1) {return; }
		iStart +=10;
	}
	iStop = line.indexOf(']', iStart);
	if (iStart === -1 ) {return; }
	line = line.substring(iStart, iStop+1);
	try {
		console.log(line);
		var obj = JSON.parse(line);
		return obj;
	} catch (e) {
		console.log("Invalid using statement.");
	}
}

// extracts the using statement array from from the code.
// for example extracts this array : var using = ["DiodeCtrl", "SliderCtrl", "SvgCtrl"];
/*
function getCodeUsingStatement(session){
	var line, arr, lower, obj;
	for(var i = 0; i<session.getLength(); i++){
		line = $.trim(session.getLine(i));
		lower = line.toLowerCase();
		arr = line.split(" ");
		if (arr[0]!=='var') {continue;}
		if (arr[1]!=='using'){
			if (arr[1].indexOf('using=') !== 0) {continue;}
		}
		else {
			if (arr[2]!=='='){continue;}
		}
		var iStart, iStop;
		iStart = line.indexOf('[');
		if (iStart === -1 ){continue;}
		iStop = line.indexOf(']', iStart);
		if (iStop === -1 ){continue;}
		line = line.substring(iStart, iStop + 1);
		obj = JSON.parse(line);
	}
	return obj;
}
*/
function removeKnownAnnotations(strCode, annotations){

	var  i = annotations.length;
	while (i--) {
		if(isKeyword(strCode, annotations[i].text)) {
		annotations.splice(i, 1);
		}
	}
	return annotations.length;
}

function isKeyword(strCode, annotation){
	var end = annotation.indexOf("' is not defined.");
	if (end === -1 ) {return false;}
	var word = annotation.substring(1, end);
	switch(word){
		case "$"				:
		case "Device"			:
		case "PinControl"		:
		case "ControlElement"	:
								return true;

	}
	//example "'DiodeCtrl' is not defined."
	
	var obj = extractUsingArray(strCode, false);
	if (obj !== undefined){
		var index = obj.indexOf(word);
		return (index > -1);
	}
	return false;
}
function isEditorTextValid(editor){
	if ($.trim(editor.getValue()) === ""){
		return false;
	}
	var arr = editor.getSession().getAnnotations();
	for(var i = 0; i < arr.length; i++){
		if (arr[i].type === 'error'){
			return false;
		}
	}
	return true;
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
	if ($("#name").val() === ""){
			$(selectBtn).prop('disabled', true);  
			return;
	}
	if ($("#description").val() === ""){
			$(selectBtn).prop('disabled', true);  
			return;
	}
	
	if (editJsCard !== undefined){
		if (!isEditorTextValid(editJsCard)){	
			$(selectBtn).prop('disabled', true);  
			return;
		}
	}
	if (editJsCtrl !== undefined){
		if (!isEditorTextValid(editJsCtrl)){	
			$(selectBtn).prop('disabled', true);  
			return;
		}
	}
	if (editHtmlCtrl !== undefined){
		if (!isEditorTextValid(editHtmlCtrl)){	
			$(selectBtn).prop('disabled', true);  
			return;
		}
	}
	
	$(selectBtn).prop('disabled', false);
}

function setCommonValues(item){
	$("#name").val(item.name);
	$("#description").val(item.description);
	$("#helpurl").val(item.helpurl);
	$("#a-open-helpurl").attr({href: item.helpurl});
}

function setControlValues(item){
	editJsCtrl.setValue(item.code, -1);
	editHtmlCtrl.setValue(item.template, -1);
	setCommonValues(item);
}
function setCardValues(item){
	editJsCard.setValue(item.code, -1);
	setCommonValues(item);
}
function getControl(id){
	var url = SERVER+'/controls/item/'+id;
		var request = $.get(url);
	request.done(function( data ) {
		setControlValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
			else if (data.status===404){
				showModal("Not found!", data.responseText);
			}
		});
}

function getCard(id){
	var url = SERVER+'/cards/item/'+id;
		var request = $.get(url);
	request.done(function( data ) {
		setCardValues(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
			else if (data.status===404){
				showModal("Not found!", data.responseText);
			}
		});
}

/*$(function () {  
	aceInit();//when script loads this runs.
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	var control = $( '#item' ).data('control');
	var card    = $( '#item' ).data('card');
	if (control !== undefined){ getControl(control.id);	}
	if (card !== undefined){ getCard(card.id);	}

});*/

function initAce(){
	aceInit();//when script loads this runs.
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	var control = $( '#item' ).data('control');
	var card    = $( '#item' ).data('card');
	if (control !== undefined){ getControl(control.id);	}
	if (card !== undefined){ getCard(card.id);	}
}

function resizeAceWindow(buttonHtmlElement){
	var	i, grow, $button, $container, $editor, w,h, editorId, ctrl;

	//get id of the div parent div of the parent div of the editor
	//id of the parent parent div should be appended to the button id in the DOM
	i = buttonHtmlElement.id.indexOf('_');
	if (i<1){ 
		return;
	}

	$container = $('#'+buttonHtmlElement.id.substring(i+1));

	$editor = $container.find('.ace_editor');
	editorId = $editor.id;
	if (editorId == undefined){
		editorId = $editor.get(0).id;
	}

	console.log(editorId);
		switch(editorId){
		case 'editor-js-card' : ctrl = editJsCard; 		break;
		case 'editor-js-ctrl' : ctrl = editJsCtrl; 		break;
		case 'editor-html-ctrl' : ctrl = editHtmlCtrl; 	break;
		default : return; //invalid id.
		
	}
	
	
	//check if we are suppose to grow to windowsize or shrink to default.
	//find class "glyphicon-plus" of the subelement span
	$button = $('#'+buttonHtmlElement.id);
	grow = $button.find("span").hasClass("glyphicon-plus");
	if (grow){
		w = $(window).width() * 0.8;
		h = $(window).height() * 0.91;
		if (w > 2048){
			w = 900; //no need to grow more
		} 
		$container.width( w );
		$container.height( h );
		$container.css( "padding-right", "10px");
		
		$editor.height( h );
		$button.find("span").removeClass("glyphicon-plus").addClass("glyphicon-minus");
		
	} else {
		w = "100%";
		h = "100%";
		$container.width( w );
		$container.height( h );
		$editor.height($container.width());
		$editor.height($container.height());
		$container.css( "padding-right", "0px" );
		$button.find("span").removeClass("glyphicon-minus").addClass("glyphicon-plus");
	}

	ctrl.resize();
	
}

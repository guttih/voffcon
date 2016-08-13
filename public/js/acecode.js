
function initEditor(editorId, mode, theme, strValue){
	//https://ace.c9.io/build/kitchen-sink.html
	// https://github.com/ajaxorg/ace/wiki/Configuring-Ace
element = document.getElementById(editorId);
if (element === null){ return;}
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
		edi.setValue(strValue);
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

var editor1 = initEditor('editor-js-ctrl',   'javascript', 'monokai');
var editor4 = initEditor('editor-js-card',   'javascript', 'monokai');
var editor3 = initEditorText('editor-desc');


var editor2 = initEditor('editor-html-ctrl',   'html', 'chaos');

$('#btnSaveControl').click(function() {
	var strCode = editor1.getValue();
	var strHtml = editor2.getValue();
	console.log("html template:");
	console.log(strHtml);
	console.log("Control class:");
	console.log(strCode);
	
});
$('#btnSaveCard').click(function() {
	var strCard = editor4.getValue();
	console.log("card code:");
	console.log(strCard);
	
});

function aceInit(){
	

}

aceInit();
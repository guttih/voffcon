var editor1 = ace.edit("editorjs");
    editor1.setTheme("ace/theme/monokai");
    editor1.getSession().setMode("ace/mode/javascript");


var str = "function foo(items) { \n"+
		"	var x = 'þetta er málið';\n"+
		"	return x;\n"+
		"}\n";
editor1.setValue(str);

var editor2 = ace.edit("editorHtml");
    editor2.setTheme("ace/theme/chaos");
    editor2.getSession().setMode("ace/mode/html");
str = "<div id='editorHtml'>this will be a html code</div>";
editor2.setValue(str);

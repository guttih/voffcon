$(function () {  
		getFile('/README.md', function(text){
		var converter = new showdown.Converter(),
			html      = converter.makeHtml(text),
		element = document.getElementById("markdown");
		element.innerHTML=html;
	});
});

$(function () {  
		getFile('/docs/licence/COPYING.md', function(text){
		var converter = new showdown.Converter(),
			html      = converter.makeHtml(text),
		element = document.getElementById("markdown");
		element.innerHTML=html;
	});
});

function getServer(){
	if (window.location.protocol === 'file:')
	{	//todo: remove dummy
		return 'http://www.guttih.com:6100';
	}
	return window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
}
function getFile(filename, successFunc){
	var url = getServer() +'/file';
	
	var request = $.get(url, {name:filename});
	request.done(function( data ) {
		// Put the results in a div
		console.log(data);
		successFunc(data);
		}).fail(function( data ) {
			console.err(data);
		});
}

/*
        Ardos is a system for controlling devices and appliances from anywhere.
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

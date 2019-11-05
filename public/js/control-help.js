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

function init(){
	var editor = ace.edit("editor1");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
	editor.setReadOnly(true);
	editor.session.setUseWorker(false);
	var des = item.description.replaceAll(/\r\n\r\n|\n\n/,'</p><p>');
	des = des.replaceAll(/\r\n/,'</br>');
	des = des.replaceAll(/\r|\n/,'</br>');
	des = '<p>'+des+'</p>';
	$('#description').html(des);
	if (item.example !== undefined) {
		var lineCount = item.example.split(/\r\n|\r|\n/).length;
		var height = Math.round(lineCount*14.8780487805)+15;
		$('#editor1').css('height',height+'px');
		editor.setValue(item.example, -1);
	}
}

$(function () {  
	init();
});

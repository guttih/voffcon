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


function initCard(){
		if (typeof itemUpload !== 'undefined' && itemUpload !== 'undefined') {

			if (itemUpload.name !== undefined){
				$("#name").val( itemUpload.name );
			}
			
			if (itemUpload.description !== undefined){
				$("#description").val( itemUpload.description );
			}
			if (itemUpload.helpurl !== undefined){
				$("#helpurl").val( itemUpload.helpurl );
				$("#a-open-helpurl").attr({href: itemUpload.helpurl});
			}

			if (itemUpload.code !== undefined){
				editJsCard.setValue(itemUpload.code, -1);
			}

			document.getElementById("card-form").action = "/cards/register";
	}
	$('#btnUserAccessCard').click(function() {
		var card    = $( '#item' ).data('card');
		if (card !== undefined && card.id !== undefined){
			window.location.href = '/cards/useraccess/'+ card.id;
		}
	});
	$('#btnExportCard').click(function() {
		var card    = $( '#item' ).data('card');
		if (card !== undefined && card.id !== undefined){
			window.location.href = '/cards/export/'+ card.id;
		}
	});
}

$(function () {  
	initAce();
	initCard();
});

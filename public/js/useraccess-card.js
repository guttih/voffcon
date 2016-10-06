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
var item;


$('#btnUpdateAccessCard').click(function() {

	var obj = { owners: [],
					users:  []};
	$('#user-list').children().each(function () {
		var id = $(this).attr('id');

		var sel = $('#' + id +' select');
		var val = sel.val();
		if (val === "2"){
			obj.owners.push(id);
		} else if (val === "1"){
			obj.users.push(id);
		}  
	});
	
	var cid = item._id;
	var sendObj = {};
	sendObj.owners = JSON.stringify(obj.owners);
	sendObj.users = JSON.stringify(obj.users);
	var posting = $.post( '/cards/useraccess/'+cid, sendObj);
	posting
		.done(function(data){
			//window.location.href = '/cards/useraccess/'+cid;
			showModal("Access updated", "User access successfully updated.");
		})
		.fail(function(data){
			console.log("failed posting");
			console.log(data);
			showModalError('Error updating user access', data);
		});
	
});




var setCardValues = function setCardValues(cardData){
	item = cardData;
	getUserUserList(function(allUsersData){
		users = allUsersData;
		setUserlistValues(users, true);
	}, true);
};

function getCard(callback){
	var cardId = getLastItemOfUrl(window.location.href);
	if (cardId === undefined || cardId.length < 11) {
		return; //invalid at end of url;
	}
	var url = '/cards/item/' + cardId;
	requestData(url, callback);
}

$(function () {
	getCard(setCardValues);
});

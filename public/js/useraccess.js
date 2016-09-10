function getUserList(callback){
	var url = getServerUrl() + '/users/user-list';
		var request = $.get(url);
	request	.done(callback(data))
			.fail(function( data ) {
				if (data.status===401){
					showModal("You need to be logged in!", data.responseText);
				}
			});
}

function getServerUrl(){
	var serverUrl = window.location.protocol + '//' + window.location.hostname +(window.location.port ? ':'+window.location.port: '');
	return serverUrl;
}



//returns undefined if the last item is not found
//
function getLastItemOfUrl(url){
	
	if (url === undefined) return;
	var i = url.lastIndexOf('/');
	if (i < 0) { return;}
	var ret = url.substr(i + 1); 
	return ret;
}


function getCard(callback){
	var cardId = getLastItemOfUrl(window.location.href);
	if (cardId === undefined || cardId.length < 11) {
		return; //invalid at end of url;
	}
	var url = '/cards/item/' + cardId;
	requestData(url, callback);
}


//finds the access level of a user to a given control card
function getCardUserAccessLevel(card, id){
	if (card === undefined) {return 0;}
	if (card.owners === undefined) {return 0;}
	if (card.users === undefined) {return 0;}

	for (var i = 0; i < card.owners.length; i++) {
		if (card.owners[i]._id === id){
			return 2;
		}
	}
	for (var i = 0; i < card.users.length; i++) {
		if (card.users[i]._id === id){
			return 1;
		}
	}
	return 0;
} 

var setUserlistValues = function setUserlistValues(userList){
	var id, name, description; 
	for(var i = 0; i < userList.length; i++){
		id 		= userList[i].id;
		name 		= userList[i].name;
		description = userList[i].description;
		
		var accessLevel = getCardUserAccessLevel(card, id);
		var str =  createListItemUserAccess(id, name, description, 'users', accessLevel);
		$("#user-list").append(str);
	}
	setSelectAccessBackgroundClick();

}



var card;
var users;
var setCardValues = function setCardValues(cardData){
	card = cardData;
	getUserUserList(function(allUsersData){
		users = allUsersData;
		setUserlistValues(users);
	});
}



$('#btnUpdateAccessCard').click(function() {

	var obj = { owners: [],
					users:  []};
	$('#user-list').children().each(function () {
		var id = $(this).attr('id');

		var sel = $('#' + id +' select');
		val = sel.val();
		if (val === "2"){
			obj.owners.push(id);
		} else if (val === "1"){
			obj.users.push(id);
		}  
	});
	
	var cid = card._id;
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

$(function () {
	var url = getServerUrl();
	console.log(url);
	getCard(setCardValues);

});
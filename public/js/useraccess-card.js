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
		setUserlistValues(users);
	});
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
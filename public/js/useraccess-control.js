$('#btnUpdateAccessControl').click(function() {

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
	var posting = $.post( '/controls/useraccess/'+cid, sendObj);
	posting
		.done(function(data){
			//window.location.href = '/controls/useraccess/'+cid;
			showModal("Access updated", "User access successfully updated.");
		})
		.fail(function(data){
			console.log("failed posting");
			console.log(data);
			showModalError('Error updating user access', data);
		});
	
});


var setControlValues = function setControlValues(controlData){
	item = controlData;
	getUserUserList(function(allUsersData){
		users = allUsersData;
		setUserlistValues(users, true);
	}, true);
};

function getControl(callback){
	var controlId = getLastItemOfUrl(window.location.href);
	if (controlId === undefined || controlId.length < 11) {
		return; //invalid at end of url;
	}
	var url = '/controls/item/' + controlId;
	requestData(url, callback);
}

$(function () {
	getControl(setControlValues);
});
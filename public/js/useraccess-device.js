$('#btnUpdateAccessDevice').click(function() {

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
	var posting = $.post( '/devices/useraccess/'+cid, sendObj);
	posting
		.done(function(data){
			//window.location.href = '/devices/useraccess/'+cid;
			showModal("Access updated", "User access successfully updated.");
		})
		.fail(function(data){
			console.log("failed posting");
			console.log(data);
			showModalError('Error updating user access', data);
		});
	
});


var setDeviceValues = function setDeviceValues(deviceData){
	item = deviceData;
	getUserUserList(function(allUsersData){
		users = allUsersData;
		setUserlistValues(users, false);
	}, false);
};

function getDevice(callback){
	var deviceId = getLastItemOfUrl(window.location.href);
	if (deviceId === undefined || deviceId.length < 11) {
		return; //invalid at end of url;
	}
	var url = '/devices/item/' + deviceId;
	requestData(url, callback);
}

$(function () {
	getDevice(setDeviceValues);
});
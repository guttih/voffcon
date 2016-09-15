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
function getLastItemOfUrl(url){
	
	if (url === undefined) {return;}
	var i = url.lastIndexOf('/');
	if (i < 0) { return;}
	var ret = url.substr(i + 1); 
	return ret;
}

//finds the access level of a user to a given card, control or device
function getItemUserAccessLevel(inItem, id){
	var i;

	if (inItem === undefined) {
		return 0;
	}

	if (inItem.owners !== undefined) {
		for (i = 0; i < inItem.owners.length; i++) {
			if (inItem.owners[i]._id === id){
				return 2;
			}
		}	
	}

	if (inItem.users !== undefined) {
		for (i = 0; i < inItem.users.length; i++) {
			if (inItem.users[i]._id === id){
				return 1;
			}
		}
	}
	
	return 0;
} 

var setUserlistValues = function setUserlistValues(userList, includeOption1){
	var id, name, description; 
	for(var i = 0; i < userList.length; i++){
		id 		= userList[i].id;
		name 		= userList[i].name;
		description = userList[i].description;
		
		var accessLevel = getItemUserAccessLevel(item, id);
		var str =  createListItemUserAccess(id, name, description, 'users', accessLevel, includeOption1);
		$("#user-list").append(str);
	}
	setSelectAccessBackgroundClick();
};

var item;
var users;
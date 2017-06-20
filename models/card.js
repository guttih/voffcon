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
"use strict";
var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Card Schema
// 	Info on Schema types: http://mongoosejs.com/docs/schematypes.html
var CardSchema = mongoose.Schema({
	name: {
		type: String,
		index:true
	},
	description: {
		type: String
	},	
	helpurl: {
		type: String
	},
	code: {
		type: String
	},
	/*These users are allowed to modify or delete this card*/
	 owners: [{ObjectId}],
	 /*These users are allowed to use this card*/
	 users: [{ObjectId}]
});

var Card = module.exports = mongoose.model('Card', CardSchema);

/*
userId Must be provided, because there needs to be at least one user who can access
and modify this Card.
*/
module.exports.create = function(newCard,  callback){
		newCard.save(callback);
};

module.exports.getByName = function(Cardname, callback){
	var query = {Cardname: Cardname};
	Card.findOne(query, callback);
};

module.exports.getById = function(id, callback){
	Card.findById(id, callback);
};


module.exports.modify = function (id, newValues, callback){
	var val = {$set: newValues};
	Card.update({_id: id}, val, callback);
};


//creates a error object with a error messge intended to display for the user. 
function errorToUser(msg, statusCode){
	var obj = {
		messageToUser : msg
	};
	if (statusCode !== undefined){
		obj["statusCode"] = statusCode;
	}
	return obj;
}

module.exports.modifyUserAccess = function (CardId, newValues, callback){
	var query = {	_id: CardId	};

	if (newValues.owners === undefined && newValues.users === undefined ) {
		return callback(errorToUser("No owners nor users are specified.", 400)); //nothing to change then.
	} else if ((newValues.owners !== undefined && newValues.owners.length < 1) ) {
		return callback(errorToUser("There must always be at least one owner for each card.", 403)); //there must always be at least one owner.
	}

	Card.findOne(query, function(err, card){
		if (err) {
			return callback(err); 
		} //todo: what to do, if error?  maybe throw err;

		if (newValues.owners !== undefined ){

			card.owners.splice(0,card.owners.length);
			newValues.owners.forEach(function(element) {
				card.owners.push(element);
			}, this);
		}

		if (newValues.users !== undefined){
			card.users.splice(0,card.users.length);
			newValues.users.forEach(function(element) {
				card.users.push(element);
			}, this);
		}

		card.save(callback);
	});
};


module.exports.delete = function (id, callback){
	
	Card.findByIdAndRemove(id, callback);
};

module.exports.listByUserId = function (userId, callback){
	var query = {users:{$elemMatch: { _id:userId }}};
	Card.find(query, callback);
};

module.exports.listByOwnerId = function (userId, callback){
	var query = {owners:{$elemMatch: { _id:userId }}};
	Card.find(query, callback);
};
module.exports.listByOwnerAndUserId = function (userId, callback){
		var query = {
					$or:[
							{users:{$elemMatch: { _id:userId }}},
							{owners:{$elemMatch: { _id:userId }}}
						]
				};
	Card.find(query, callback);

	/*var queryUsers = {users:{$elemMatch: { _id:userId }}};
	var queryOwners = {owners:{$elemMatch: { _id:userId }}};

	Card.find(queryUsers, function(err, users){
		users.forEach(function(element) {
			console.log(element.name);
		}, this);*/
		/*users.each(function(err, data){
						console.log('user:' + data.name);
				});
		Card.find(queryOwners, function(err, owners){
				owners.each(function(err, data){
						console.log('owner:' + data.name);
				});
		});

	})*/
};
/*if you only want users to get cards that they have access to, use this function*/
module.exports.getUserCardById = function (CardId, userId, callback){
	var query = {	_id: CardId,
					$or:[
							{users:{$elemMatch: { _id:userId }}},
							{owners:{$elemMatch: { _id:userId }}}
						]
				};
	Card.find(query, callback);
};

/*if you only want owners to get their cards use this function*/
module.exports.getOwnerCardById = function (CardId, userId, callback){
	var query = {	_id: CardId,
					owners:{$elemMatch: { _id:userId }}
		};
	Card.find(query, callback);
};




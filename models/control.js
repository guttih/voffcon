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

/* create your control collection
 	goto mongo bin folder and type:
	 mongo
	 use voffcon
	 db.createCollection('controls');
	 show
*/
//tutorial : https://www.youtube.com/watch?v=Z1ktxiqyiLA
var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Control Schema
// 	Info on Schema types: http://mongoosejs.com/docs/schematypes.html
var ControlSchema = mongoose.Schema({
	name: {
		type: String
	},
	description: {
		type: String
	},	
	helpurl: {
		type: String
	},
	template: {
		type: String
	},
	code: {
		type: String
	},
	 owners: [{ObjectId}],
	 users: [{ObjectId}]
});
	/*owners are users, allowed to modify or delete this control*/
var Control = module.exports = mongoose.model('Control', ControlSchema);

/*
userId Must be provided, because there needs to be at least one user who can access
and modify this Control.
*/
module.exports.create = function(newControl,  callback){
		newControl.save(callback);
};

module.exports.getByName = function(Controlname, callback){
	var query = {Controlname: Controlname};
	Control.findOne(query, callback);
};
module.exports.getByNames = function(ControlnameArray, callback){
	
	var query = {name: { $in: ControlnameArray }};
	Control.find(query, callback);
};

module.exports.getById = function(id, callback){
	Control.findById(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	Control.update({_id: id}, val, callback);
};

module.exports.delete = function (id, callback){
	
	Control.findByIdAndRemove(id, callback);
};

//get all controls
module.exports.list = function(callback){
	var query = {};
	Control.find(query, callback);
};
//gets an array of control names
module.exports.listNames = function(callback){
	var query = {};
	var x = Control.find(query,{"name" : 1},function(err, list){
		if (err !== null) {
			callback(err, list);
		} else {
			//let's convert list to array of strings
			var nameArray = [];
			if (list !== undefined && list.length > 0) {
				list.forEach(function(item){
					nameArray.push(item._doc.name);
				});
			}
			nameArray.sort();
			callback(err, nameArray);
		}
	});
};

//get all controls owned by the given user
module.exports.listByOwnerId = function (userId, callback){
	var query = {owners:{$elemMatch: { _id:userId }}};
	Control.find(query, callback);
};

//get only control if the user is the owner of that control
module.exports.getOwnerControlById = function (ControlId, userId, callback){
	var query = {	_id: ControlId,
					owners:{$elemMatch: { _id:userId }}
		};
	Control.find(query, callback);
};

/*if you only want users to get controls that they have access to, use this function*/
/* UNUSED FUNCTION
module.exports.getUserControldById = function (ControlId, userId, callback){
	var query = {	_id: ControlId,
					$or:[
							{users:{$elemMatch: { _id:userId }}},
							{owners:{$elemMatch: { _id:userId }}}
						]
				};
	Control.find(query, callback);
};*/

module.exports.modifyUserAccess = function (ControlId, newValues, callback){
	var query = {	_id: ControlId	};

	if (newValues.owners === undefined && newValues.users === undefined ) {
		return callback(errorToUser("No owners nor users are specified.", 400)); //nothing to change then.
	} else if ((newValues.owners !== undefined && newValues.owners.length < 1) ) {
		return callback(errorToUser("There must always be at least one owner for each control.", 403)); //there must always be at least one owner.
	}

	Control.findOne(query, function(err, control){
		if (err) {
			return callback(err); 
		} //todo: what to do, if error?  maybe throw err;

		if (newValues.owners !== undefined ){

			control.owners.splice(0,control.owners.length);
			newValues.owners.forEach(function(element) {
				control.owners.push(element);
			}, this);
		}

		if (newValues.users !== undefined){
			control.users.splice(0,control.users.length);
			newValues.users.forEach(function(element) {
				control.users.push(element);
			}, this);
		}

		control.save(callback);
	});
};

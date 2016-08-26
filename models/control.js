"use strict";

/* create your control collection
 	goto mongo bin folder and type:
	 mongo
	 use ardos
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
	template: {
		type: String
	},
	code: {
		type: String
	},
	 owners: [{ObjectId}]
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
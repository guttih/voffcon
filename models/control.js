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
module.exports.createControl = function(newControl,  callback){
		newControl.save(callback);
};

module.exports.getControlByControlname = function(Controlname, callback){
	var query = {Controlname: Controlname};
	Control.findOne(query, callback);
};

module.exports.getControlById = function(id, callback){
	Control.findById(id, callback);
};

module.exports.listControlsByOwnerId = function (id, callback){
	var query = {owners:{$elemMatch: { _id:id }}};
	Control.find(query, callback);
};

module.exports.getOwnerControlsById = function (ControlId, userId, callback){
	var query = {	_id: ControlId,
					owners:{$elemMatch: { _id:userId }}
		};
	Control.find(query, callback);
};
"use strict";
var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Controller Schema
var ControllerSchema = mongoose.Schema({
	name: {
		type: String
	},
	template: {
		type: String
	},
	code: {
		type: String
	},
	/*these users are allowed to edit this control*/
	 users: [{ObjectId}]
});

var Controller = module.exports = mongoose.model('Controller', ControllerSchema);

/*
userId Must be provided, because there needs to be at least one user who can access
and modify this Controller.
*/
module.exports.createController = function(newController,  callback){
		newController.save(callback);
};

module.exports.getControllerByControllername = function(Controllername, callback){
	var query = {Controllername: Controllername};
	Controller.findOne(query, callback);
};

module.exports.getControllerById = function(id, callback){
	Controller.findById(id, callback);
};

module.exports.listControllersByUserId = function (id, callback){
	var query = {users:{$elemMatch: { _id:id }}};
	Controller.find(query, callback);
};

module.exports.getUserControllersById = function (ControllerId, userId, callback){
	var query = {	_id: ControllerId,
					users:{$elemMatch: { _id:userId }}
		};
	Controller.find(query, callback);
};
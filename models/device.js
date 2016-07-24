"use strict";
var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Device Schema
var DeviceSchema = mongoose.Schema({
	url: {
		type: String,
		index:true
	},
	name: {
		type: String
	},

	 users: [{ObjectId}]
});

var Device = module.exports = mongoose.model('Device', DeviceSchema);

/*
userId Must be provided, because there needs to be at least one user who can access
and modify this device.
*/
module.exports.createDevice = function(newDevice,  callback){
		newDevice.save(callback);
};

module.exports.getDeviceByDevicename = function(Devicename, callback){
	var query = {Devicename: Devicename};
	Device.findOne(query, callback);
};

module.exports.getDeviceById = function(id, callback){
	Device.findById(id, callback);
};

module.exports.listDevicesByUserId = function (id, callback){
	var query = {users:{$elemMatch: { _id:id }}};
	Device.find(query, callback);
};

module.exports.getUserDevicesById = function (deviceId, userId, callback){
	var query = {	_id: deviceId,
					users:{$elemMatch: { _id:userId }}
		};
	Device.find(query, callback);
};
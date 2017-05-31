/*
        Ardos is a system for controlling devices and appliances from anywhere.
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

// Device Schema
// 	Info on Schema types: http://mongoosejs.com/docs/schematypes.html
var DeviceSchema = mongoose.Schema({
	url: {
		type: String,
		index:true
	},
	name: {
		type: String
	},
	type: {
		type: String
	},
	
	description: {
		type: String
	},	
	helpurl: {
		type: String
	},
	canLog: {
		type: Boolean
	},
	 owners: [{ObjectId}]
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
	//todo: is this query not suppose to be var query = {name: Devicename};
	var query = {Devicename: Devicename};
	Device.findOne(query, callback);
};

module.exports.getById = function(id, callback){
	Device.findById(id, callback);
};

module.exports.listByOwnerId = function (id, callback){
	var query = {owners:{$elemMatch: { _id:id }}};
	Device.find(query, callback);
};

/*if you only want owners to get the device use this function*/
module.exports.getOwnerDeviceById  = function (deviceId, userId, callback){
	var query = {	_id: deviceId,
					owners:{$elemMatch: { _id:userId }}
		};
	Device.find(query, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	Device.update({_id: id}, val, callback);
};

module.exports.delete = function (id, callback){
	
	Device.findByIdAndRemove(id, callback);
};

module.exports.modifyUserAccess = function (DeviceId, newValues, callback){
	var query = {	_id: DeviceId	};

	if (newValues.owners === undefined && newValues.users === undefined ) {
		return callback(errorToUser("No owners nor users are specified.", 400)); //nothing to change then.
	} else if ((newValues.owners !== undefined && newValues.owners.length < 1) ) {
		return callback(errorToUser("There must always be at least one owner for each device.", 403)); //there must always be at least one owner.
	}

	Device.findOne(query, function(err, device){
		if (err) {
			return callback(err); 
		} //todo: what to do, if error?  maybe throw err;

		if (newValues.owners !== undefined ){

			device.owners.splice(0,device.owners.length);
			newValues.owners.forEach(function(element) {
				device.owners.push(element);
			}, this);
		}

		if (newValues.users !== undefined){
			device.users.splice(0,device.users.length);
			newValues.users.forEach(function(element) {
				device.users.push(element);
			}, this);
		}

		device.save(callback);
	});
};

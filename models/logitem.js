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

// good example about mongoose: https://www.codeproject.com/Articles/356975/A-simple-log-server-using-express-nodejs-and-mongo
//             and about types: http://mongoosejs.com/docs/schematypes.html
"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var LogItemSchema = mongoose.Schema({
        deviceid : [Schema.Types.ObjectId],
        logtype  : Number,
        datetime : Date,
        data     : String
}); 
var LogItem = module.exports = mongoose.model('LogItem', LogItemSchema);

module.exports.LogTypes = [
    'OBJECTTYPE_KEYVALUE_STRING',
    'OBJECTTYPE_KEYVALUE_INT',
    'OBJECTTYPE_PINS_ARRAY',
    'OBJECTTYPE_PIN',
    'OBJECTTYPE_PINS',
    'OBJECTTYPE_DATE',
    'OBJECTTYPE_WHITELIST_ARRAY',
    'OBJECTTYPE_STATUS',
    'OBJECTTYPE_LOG_PINS',
    'OBJECTTYPE_INFORMATION',
    'OBJECTTYPE_WARNING',
    'OBJECTTYPE_ERROR'];

module.exports.logJsonAsText = function logJsonAsText(deviceId, logType, json, callback) {
    var strData = JSON.stringify(json);
    var type = module.exports.LogTypes.indexOf('OBJECTTYPE_INFORMATION');
    var deviceObjectId = new mongoose.mongo.ObjectId(deviceId);
    var newItem = new LogItem ({
                                        deviceid : deviceObjectId,
                                        logtype: logType,
                                        datetime : Date(),
                                        data     : strData
                                    });
    newItem.save(callback);
};
module.exports.isObjectIdStringValid = function (idString) {
        var ObjectId = mongoose.Types.ObjectId;
        var ret = ObjectId.isValid(idString);
        return ret;
}

module.exports.delete = function (id, callback){
	
	LogItem.findByIdAndRemove(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	LogItem.update({_id: id}, val, callback);
};

module.exports.createLogItem = function(newLogItem,  callback){
        newLogItem.save(callback);
};
module.exports.getById = function(id, callback){
	LogItem.findById(id, callback);
};

module.exports.listByDeviceId = function(deviceId, callback){
	var query = {deviceid: deviceId};
	LogItem.find(query, callback);
};

//lists all devices which have logs
module.exports.listAllDevices = function(callback){
	LogItem.find().distinct( 'deviceid', callback);
};

module.exports.countDeviceOccurrence = function(deviceId, callback){
        var query = {deviceid : deviceId};
	LogItem.count(query, callback);
};

module.exports.getById = function(id, callback){
	Device.findById(id, callback);
};


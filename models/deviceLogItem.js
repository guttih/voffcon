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

// good example about mongoose: https://www.codeproject.com/Articles/356975/A-simple-log-server-using-express-nodejs-and-mongo
//             and about types: http://mongoosejs.com/docs/schematypes.html
"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var DeviceLogItemSchema = mongoose.Schema({
        deviceid : [Schema.Types.ObjectId],
        logtype  : Number,
        datetime : Date,
        data     : String
}); 
var DeviceLogItem = module.exports = mongoose.model('DeviceLogItem', DeviceLogItemSchema);

module.exports.DeviceLogTypes = ['information', 'warning' ,'error', 'key-value-json', 'string-array'];

module.exports.logInformation = function logInformation(deviceId, informationString, callback) {

    var type = module.exports.DeviceLogTypes.indexOf('information');
    //var deviceObjectId = new Schema.Types.ObjectId(deviceId);
    var deviceObjectId = new mongoose.mongo.ObjectId(deviceId);
    var newItem = new DeviceLogItem ({
                                        deviceid : deviceObjectId,
                                        logtype: (type >= 0 ? type : 0),
                                        datetime : Date(),
                                        data     : informationString
                                    });
    newItem.save(callback);
};
module.exports.isObjectIdStringValid = function (idString) {
        var ObjectId = mongoose.Types.ObjectId;
        var ret = ObjectId.isValid(idString);
        return ret;

}

module.exports.createDeviceLogItem = function(newDeviceLogItem,  callback){
        newDeviceLogItem.save(callback);
};
module.exports.getById = function(id, callback){
	DeviceLogItem.findById(id, callback);
};

module.exports.listByDeviceId = function(deviceId, callback){
	var query = {deviceid: deviceId};
	DeviceLogItem.find(query, callback);
};

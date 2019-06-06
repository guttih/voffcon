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
var MonitorSchema = mongoose.Schema({
        deviceid       : Schema.Types.ObjectId,
        pin            : Number,
        minLogInterval : Number,
        pinValueMargin : Number,
        sampleInterval : Number,
        sampleTotalCount:Number
}); 
var Monitor = module.exports = mongoose.model('Monitor', MonitorSchema);

/**
 * Saves monitors from a device
 * @param {String}   deviceId The id of the device these monitors belong to
 * @param {Array}    monitors Array of monitors
 * @param {function} callback Function which will be called when last monitor has been saved
 */
module.exports.saveMonitors = function monitorJsonAsText(deviceId, monitors, callback) {
        if (monitors === undefined || !Array.isArray(monitors)) {
                callback({error:'invalid object'});
                return;
        }
        if (monitors.length < 1) {
                callback(null); //not an error just empty
                return;
        }

    var deviceObjectId = new mongoose.mongo.ObjectId(deviceId);
    var saveMonitors = [];
    monitors.forEach(function(item){
            saveMonitors.push(new Monitor (
                                                {
                                                    deviceid       : deviceObjectId,
                                                    pin            : item.pin,
                                                    minLogInterval : item.minLogInterval,
                                                    pinValueMargin : item.pinValueMargin,
                                                    sampleInterval : item.sampleInterval,
                                                    sampleTotalCount:item.sampleTotalCount
                                                }
                                        )
                                );
    });

    for(var i = 0; i<saveMonitors.length -1; i++) {
        saveMonitors[i].save();
    }

    saveMonitors[saveMonitors.length-1].save(callback);
};
module.exports.isObjectIdStringValid = function (idString) {
        var ObjectId = mongoose.Types.ObjectId;
        var ret = ObjectId.isValid(idString);
        return ret;
}

module.exports.delete = function (id, callback){
	
	Monitor.findByIdAndRemove(id, callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	Monitor.update({_id: id}, val, callback);
};

module.exports.createMonitor = function(newMonitor,  callback){
        newMonitor.save(callback);
};

/**
 * Adds many monitors to the database
 * @param {Array} newMonitors Array of monitors
 * @param {function} callback The function to call when monitors have been added
 */
module.exports.createMonitors = function(newMonitors,  callback){
        newMonitor.save(callback);
};
module.exports.getById = function(id, callback){
	Monitor.findById(id, callback);
};

module.exports.listByDeviceId = function(deviceId, callback){
	var query = {deviceid: deviceId};
	Monitor.find(query, callback);
};

module.exports.deleteAllDeviceRecords = function(deviceId, callback){
	var query = {deviceid: deviceId};
	Monitor.deleteMany(query, callback);
};

module.exports.countMonitorsByDeviceId = function(deviceId, callback){
	var query = {deviceid: deviceId};
	Monitor.find(query).count(callback);
};

//lists all devices which have monitors
module.exports.listAllDevices = function(callback){
	Monitor.find().distinct( 'deviceid', callback);
};

// Finds all devices with monitors and returns their ID 
// and how many monitor items belong to them
module.exports.devicesMonitorCount = function(callback){
        // more about aggregate
        // http://excellencenodejsblog.com/mongoose-aggregation-count-group-match-project/
        Monitor.aggregate([
                {
                    $group: {
                        _id: '$deviceid',  //$region is the column name in collection
                        count: {$sum: 1}
                    }
                }
            ], callback);
};

module.exports.countDeviceOccurrence = function(deviceId, callback){
        var query = {deviceid : deviceId};
	Monitor.count(query, callback);
};

module.exports.getById = function(id, callback){
	Monitor.findById(id, callback);
};


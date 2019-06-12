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
var TriggerActionSchema = mongoose.Schema({
		id     : Schema.Types.ObjectId,
		actinId : Schema.Types.ObjectId,
		deviceId : Schema.Types.ObjectId,
        date   : Number,
});

var TriggerAction = module.exports = mongoose.model('TriggerAction', TriggerActionSchema);

/**
 * Copies all values from a TriggerAction Schema object to a new raw object.
 * @param {TriggerActionSchema} triggerActionSchemaObject mongoose Schema object to convert 
 * @param {Boolean}       dateAsMilliseconds if true then the date object will be converted to the number of milliseconds since 1. of January 1970 UTC 
 */
TriggerAction.copyValues = function copyValues(triggerActionSchemaObject, dateAsMilliseconds){
	return{
		id       : triggerActionSchemaObject.id,
		date     : (dateAsMilliseconds!== undefined && dateAsMilliseconds === true)?
		triggerActionSchemaObject.date.toTime() : triggerActionSchemaObject.date,
		url   : String,
		body  : String,
		deviceId : triggerActionSchemaObject.deviceId
	};
}

module.exports.getById = function(id, callback){
	TriggerAction.findById(id, callback);
};

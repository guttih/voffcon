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
		id       : Schema.Types.ObjectId,
		deviceId : Schema.Types.ObjectId,
                date     : Date,
                /*
                        When type is:
                        WEEKLY      : This value will contain a array of numbers representing the day of week.  Where Sunday is 0, Monday is 1, and so on.
                        MONTHLY-LAST: This value will contain the number of days from last day of the current month.  When 0 then this fire will take place on last day.  When 1 then the fire will take place the day before last day.
                */
                dateData : String,
                /*
                        LOG-INSTANT  : Fires instantly after a new log arrives from a device
                        ONES         : Fires ones, on a specified date and time.
                        TIMELY       : Fires every specified time.  
                                        Some examples: 
                                                Date(             30000) :Will Fire every 30 seconds
                                                Date(     5 * 60 * 1000) :Will fire every 5 minutes
                                                Date(3 * 60 * 60 * 1000):Will fire every 3 hours

                        DAILY        : Fires every day at a specified time (date part of date is ignored)
                        WEEKLY       : Fires every week on the days listed in a array in dayData
                        MONTHLY      : Fires ones a month.  Note if day is more than 28 then this will not fire in february.  When MONTHLY timer is suppose to fire near the last day of month use MONTHLY-LAST type.
                        YEARLY       : Fires ones a year.
                        MONTHLY-LAST : Fires ones a month, but counting the days from the last day of the month.  F.example. if date is 1.1.2018 11:21:00 and dateData is 0.  Then this triggerAction will fire first on 30 jan 2018 and next on 28.2.1019.  In february 2020 (a leap year) this triggerAction would fire on the 29.2.2020 at 11:21.  If dateData is 1 then the fire will be the day before last day of month. 
                */
                type : {type   : String,
                            enum   : ['LOG-INSTANT','ONES','TIMELY','DAILY','WEEKLY','MONTHLY','YEARLY', 'MONTHLY-LAST'],
                            default: 'ONES'},
                /*      The date when this triggerAction expires*/
                dateExpires : Date,
                method      : {type   : String,
                               enum   : ['GET','POST','DELETE'],
                               default: 'GET'                 },
                url         : String,
                body        : String,
                description : String
});

var TriggerAction = module.exports = mongoose.model('TriggerAction', TriggerActionSchema);

/**
 * Copies all values from a TriggerAction Schema object to a new raw object.
 * @param {TriggerActionSchema} triggerActionSchemaObject mongoose Schema object to convert 
 * @param {Boolean}       dateAsMilliseconds if true then the date object will be converted to the number of milliseconds since 1. of January 1970 UTC 
 */
TriggerAction.copyValues = function copyValues(triggerActionSchemaObject, dateAsMilliseconds){
        
	return {
                id         : triggerActionSchemaObject._id,
		date       : (dateAsMilliseconds!== undefined && dateAsMilliseconds === true)?
                triggerActionSchemaObject.date.toTime() : triggerActionSchemaObject.date,
                dateData   : triggerActionSchemaObject.dateData,
		url        : triggerActionSchemaObject.url,
		body       : triggerActionSchemaObject.body,
                deviceId   : triggerActionSchemaObject.deviceId,
                type       : triggerActionSchemaObject.type,
                method     : triggerActionSchemaObject.method,
                dateExpires: triggerActionSchemaObject.dateExpires,
                description: triggerActionSchemaObject.description
	};
};

module.exports.getById = function(id, callback){
	TriggerAction.findById(id, callback);
};

module.exports.devicesMonitorCount = function(callback){
        // more about aggregate
        // http://excellencenodejsblog.com/mongoose-aggregation-count-group-match-project/
        Monitor.aggregate([
                {
                    $group: {
                        _id: '$deviceId',  //$region is the column name in collection
                        count: {$sum: 1}
                    }
                }
            ], callback);
};

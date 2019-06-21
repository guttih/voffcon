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
                deviceId     : Schema.Types.ObjectId,
                destDeviceId : Schema.Types.ObjectId,
                date         : Date,
                /*
                        When type is:
                        WEEKLY      : This value will contain a array of numbers representing the day of week.  Where Sunday is 0, Monday is 1, and so on.
                        MONTHLY-LAST: This value will contain the number of days from last day of the current month.  When 0 then this fire will take place on last day.  When 1 then the fire will take place the day before last day.
                */
                dateData     : String,
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
                type         : {type   : String,
                            enum   : ['LOG-INSTANT','ONES','TIMELY','DAILY','WEEKLY','MONTHLY','YEARLY', 'MONTHLY-LAST'],
                            default: 'ONES'},
                /*      The date when this triggerAction expires*/
                dateExpires  : Date,
                method       : {type   : String,
                                enum   : ['GET','POST','DELETE'],
                                default: 'GET'                 },
                url          : String,
                body         : String,
                description  : String
});

var TriggerAction = module.exports = mongoose.model('TriggerAction', TriggerActionSchema);

/**
 * Copies all values from a TriggerAction Schema object to a new raw object.
 * @param {TriggerActionSchema} triggerActionSchemaObject mongoose Schema object to convert 
 * @param {Boolean}             dateAsTriggerTime if true, the date object will contain when this TriggerAction should fire next.
 * @param {Boolean}       includeId set to false if you do not want to copy the Id of the TriggerAction
 */
TriggerAction.copyValues = function copyValues(triggerActionSchemaObject, dateAsTriggerTime, includeId){
        var cleanObject = {
                
		date        : (dateAsTriggerTime!== undefined && dateAsTriggerTime === true)?
                module.exports.getTriggerTime(triggerActionSchemaObject) : triggerActionSchemaObject.date,
                dateData    : triggerActionSchemaObject.dateData,
		url         : triggerActionSchemaObject.url,
		body        : triggerActionSchemaObject.body,
                deviceId    : triggerActionSchemaObject.deviceId,
                destDeviceId: triggerActionSchemaObject.destDeviceId,
                type        : triggerActionSchemaObject.type,
                method      : triggerActionSchemaObject.method,
                dateExpires : triggerActionSchemaObject.dateExpires,
                description : triggerActionSchemaObject.description
        };
        if ( (includeId !== undefined && includeId === true) || includeId === undefined) {
                cleanObject.id = triggerActionSchemaObject._id;
        }
	return cleanObject;
};

module.exports.getById = function(id, callback){
	TriggerAction.findById(id, callback);
};

module.exports.devicesMonitorCount = function(callback){
        // more about aggregate
        // http://excellencenodejsblog.com/mongoose-aggregation-count-group-match-project/
        TriggerAction.aggregate([
                {
                    $group: {
                        _id: '$deviceId',  //$region is the column name in collection
                        count: {$sum: 1}
                    }
                }
            ], callback);
};

module.exports.modify = function (id, newValues, callback){
	//$set
	var val = {$set: newValues};
	TriggerAction.update({_id: id}, val, callback);
};

module.exports.delete = function (id, callback){
	
	TriggerAction.findByIdAndRemove(id, callback);
};

module.exports.listByDeviceId = function(deviceId, callback){
	var query = {deviceId: deviceId};
	TriggerAction.find(query, callback);
};
module.exports.listByDestDeviceId = function(destDeviceId, callback){
	var query = {destDeviceId: destDeviceId};
	TriggerAction.find(query, callback);
};

module.exports.list = function(callback){
	var query = {};
	TriggerAction.find(query, callback);
};

/**
 * Finds the date of a current or next weekday and adds the given time to it
 * @param {String} semicolonSeparatedWeekdayNumbers example: "2;6"
 * @param {Date}   currentDate Date to find the current or next weekday from
 * @param {Number} hour Range (0 - 23)
 * @param {Number} minute Range (0 - 59)
 * @param {Number} second Range (0 - 59)
 * @returns Success: a Date object
 * @returns Fail: undefined
 */
module.exports.findCurrentOrNextWeekday = function findCurrentOrNextWeekday(semicolonSeparatedWeekdayNumbers,  currentDate, hour, minute, second){
    var baseDate = new Date(currentDate.getTime());
    var baseTimeSeconds = (baseDate.getUTCHours() * 60 *60) + (baseDate.getUTCMinutes() * 60 ) + baseDate.getUTCSeconds();
    var Seconds = (hour*60*60)+(minute*60)+second;
    if (baseTimeSeconds >Seconds ){
        //Time has passed today, let's the next weekday
        baseDate.setDate(baseDate.getDate()+1);
    }
    var currentDay = baseDate.getDay();
    if (semicolonSeparatedWeekdayNumbers === undefined || semicolonSeparatedWeekdayNumbers.length < 1) { return;}
    var weekdays = semicolonSeparatedWeekdayNumbers.split(';');
    for(var i = 0; i < weekdays.length; i++) {
        weekdays[i]=Number(weekdays[i]);
    }
    var foundDay;
    if (weekdays.includes(currentDay)){
        foundDay = weekdays[weekdays.indexOf(currentDay)];
    } else {
        weekdays.sort();
        foundDay = weekdays.find(function(item) { 
            return item > currentDay; 
        });
        if (foundDay === undefined) {
            foundDay = weekdays[0];
        }
    }
    if (foundDay < currentDay ) {
        foundDay+=7;
    }
    var offset = foundDay - currentDay;
    return new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate()+offset, hour, minute, second));

};
/**
 * Calculates the day of the month from the last day.
 * @param {*} year 
 * @param {*} zeroIndexedMonth January is 0, february is 1... and december is 11.
 * @param {*} numberOfDaysFromLast Pass 0 for the last day.  Pass 1 for the day before last day of month and so on.
 * @example getDayOfMontFromLastDay(2024, 1, 0) will return 29 because 2024 is a leap year so february has 29 days. 
 * @returns a number which is the day of the month indexed from the last day of month
 */
module.exports.getDayOfMontFromLastDay =  function getDayOfMontFromLastDay(year, zeroIndexedMonth, numberOfDaysFromLast){
        var date = new Date(Date.UTC(year, zeroIndexedMonth +1, -numberOfDaysFromLast));
          return date.getUTCDate();
};

/**
 * Calculates when the TriggerAction schema object is suppose to fire
 * @param {*} triggerActionSchemaObject The object to calculate the next fire time
 * @returns Success: The fire time
 * @returns Fail: undefined.  (TriggerAction of the type LOG-INSTANT would result in a return value of undefined.)
 */
module.exports.getTriggerTime = function(triggerActionSchemaObject){
        var ta = triggerActionSchemaObject;
        var date = new Date(ta.date);
        var dateNow = new Date();
        var fireTime;
        switch (ta.type){
                //case 'TIMELY'   // This will be more tricky; how will we know when the last one fired? Do I use ta.dateData to store last fireTime
                case 'WEEKLY':      fireTime = module.exports.findCurrentOrNextWeekday(ta.dateData, dateNow, date.getUTCHours(),  date.getUTCMinutes(), date.getUTCSeconds());
                                    break;

                                   
                case 'YEARLY'       : fireTime = new Date(  dateNow.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                                                            date.getUTCHours(),  date.getUTCMinutes(), date.getUTCSeconds()  );
                                      break;
                case 'MONTHLY'      : 
                case 'MONTHLY-LAST' :     
                                        var dayOfMonth = (ta.type ==='MONTHLY')? date.getUTCDate() : module.exports.getDayOfMontFromLastDay(dateNow.getUTCFullYear(), dateNow.getUTCMonth(),Number(ta.dateData));
                                        fireTime = new Date(  dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dayOfMonth,
                                                             date.getUTCHours(),  date.getUTCMinutes(), date.getUTCSeconds()  );
                                      break;
                case 'DAILY' :        fireTime = new Date(  dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(),
                                                             date.getUTCHours(),  date.getUTCMinutes(), date.getUTCSeconds()  );
                                      break;
                case 'ONES'  :        fireTime = date;
                                      break;
        }

        return fireTime;
};
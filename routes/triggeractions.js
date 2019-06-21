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
var express = require('express');
var router = express.Router();
var request = require('request');
var lib = require('../utils/glib');
var TriggerAction = require('../models/triggerAction');
var Device = require('../models/device');
/**
 * Helper functions
 */
var utilParser = {
	validTokens : ['DEVICE_ID','DEVICE_URL','DATE','TIME','PIN_VALUE'],

	/**
	 * Checks any tokens need to be replaced with values from a device.
	 * @param {String} text 
	 * @before Assumes assumes that all tokens are valid.
	 * @returns  true if any tokens in text start with '<<DEVICE_' or '<<PIN_VALUE'
	 */
	areAnyDeviceTokens : function areAnyDeviceTokens(text) {
		return text.indexOf('<<DEVICE_')>-1 || text.indexOf('<<PIN_VALUE')>-1 ;
	},

	/**
	 * Checks any tokens need to be replaced with device pin values from a device.
	 * @param {String} text 
	 * @before Assumes assumes that all tokens are valid.
	 * @returns  true if any tokens in text start with '<<PIN_VALUE'
	 */
	areAnyDevicePinTokens : function areAnyDevicePinTokens(text) {
		return text.indexOf('<<PIN_VALUE')>-1 ;
	},
	
	/**
	 * Finds all tokens in text and returns them
	 * @param {String} text 
	 * @before Assumes assumes that all tokens are valid.
	 * @returns  Array with all the tokens found in text
	 */
	getAllTokens : function getAllTokens(text){
		var arr = [];

		var ret = 0;
		var indexStart = text.indexOf('<<');
		while (indexStart > -1) {
			indexStart+=2;
			var indexEnd = text.indexOf('>>', indexStart);
			if (indexEnd < 0) { return []; }
			var token = text.substr(indexStart, indexEnd - indexStart);
			arr.push(token);
			ret++;
			text = text.substr(indexEnd+2);
			indexStart = text.indexOf('<<');
		}
		return arr;
	},

	/**
	 * Checks if all pin tokens in text reefer to available device pins.  
	 * @param {String} text 
	*  @param {Array} devicePins List of pin objects from the device Example item:{m:2,name:"D1",pin:5,val:700} 
	 * @before Assumes assumes that all tokens are valid.
	 * @returns true if all tokens in text start with '<<PIN_VALUE' reefer to available pins
	 * @returns false if at least one device pin token reefers to a pin which is not on the device
	 */
	 areDevicePinsAvailable : function areDevicePinsAvailable(text, devicePins){
		var tokens = this.getAllTokens(text);
		var pinNumbers = [];
		devicePins.forEach( m => {
			pinNumbers.push(m.pin);
		});
		var pinTokens = tokens.filter(m => {
			return m.indexOf('PIN_VALUE')===0;
		});

		var strNum;
		var ret = true;
		pinTokens.forEach( m => {
			strNum = m.substr(9);
			if (strNum.length < 1 || Number.isNaN(strNum) || Number(strNum) < 0 || Number(strNum)> 99 ) { return false;	}
			if (!pinNumbers.includes(Number(strNum))) { 
				ret = false;
			}
			
		});
		return ret;
	},

	 /**
	 * Counts number of valid tokens in text if all are valid.
	 * @param {String} text 
	 * @returns  number of valid tokens found.
	 * @returns  0  If there are no tokens found.
	 * @returns -1 If any of the tokens found are invalid.
	 */
	countIfAllTokensAreValid : function countIfAllTokensAreValid(text){
		var ret = 0;
		var indexStart = text.indexOf('<<');
		while (indexStart > -1) {
			indexStart+=2;
			var indexEnd = text.indexOf('>>', indexStart);
			if (indexEnd < 0) { return -1; }
			var tokenToCheck = text.substr(indexStart, indexEnd - indexStart);
			var tokenIndexInArray = -1;
			this.validTokens.forEach( function(item, index) {
				if (tokenToCheck.indexOf(item) === 0) {
					tokenIndexInArray = index;
				}
			});

			if (tokenIndexInArray === -1) { return -1; }

			if (this.validTokens[tokenIndexInArray] === 'PIN_VALUE') {
				var strNum = tokenToCheck.substr(9);
				if (strNum.length < 1    || Number.isNaN(strNum) || 
					Number(strNum) < 0   || Number(strNum)> 99     ) {
					return -1;
				}
			}
			ret++;
			text = text.substr(indexEnd+2);
			indexStart = text.indexOf('<<');
		}
		return ret;
	}
	
};
 var utils = {
	
	checkTriggerActionBodyMethod: function checkTriggerActionBodyMethod(body) {
		if (body.method === undefined || body.method.length < 3){
			return [{msg:'Method is missing', param:'method', value:undefined}];
		}
		
		var validMethod = body.method === 'GET' || body.method === 'POST' || body.method === 'DELETE';
		if (!validMethod) {
			return [{msg:'Method is invalid', param:'method', value:body.method}];
		}

		return false;
	},

	checkTriggerActionBodyDescription: function checkTriggerActionBodyDescription(body) {
		if (body.description === undefined || body.description.length < 3){
			return [{msg:'Description is missing', param:'description', value:undefined}];
		}
		return false;
	},

	checkTriggerActionBodyUrl : function checkTriggerActionBodyUrl(body){
		if (body.url === undefined || body.url.length < 1){
			return [{msg:'Url is missing', param:'url', value:undefined}];
		}

		var count = utilParser.countIfAllTokensAreValid(body.url);
		if (count > 0 && utilParser.areAnyDeviceTokens(body.url)){
			if (body.deviceId === undefined) {
				return [{msg:'Device id is missing and there are one or more tokens which need it.', param:'device', value:undefined}];
			}
			if (!body.deviceId.match(/^[0-9a-fA-F]{24}$/)) {
				return [{msg:'Device id is invalid and there are one or more tokens which need it.', param:'device', value:undefined}];    
			}
		}
		if (count < 0) {
			return [{msg:'One or more tokens in url are invalid', param:'url', value:undefined}];
		}

		return false;
	},

	checkTriggerActionBodyBody : function checkTriggerActionBodyBody(body){
		if (body.body === undefined || body.body.length < 1){
			return [{msg:'Body is missing', param:'body', value:undefined}];
		}

		var count = utilParser.countIfAllTokensAreValid(body.body);
		if (count < 0) {
			return [{msg:'One or more tokens in body are invalid', param:'body', value:undefined}];
		}
		return false;
	},

	/**
	 * Checks if a variable in body exits and has valid values
	 * @param {String} variableName 
	 * @param {Number} minValue 
	 * @param {Number} maxValue 
	 */
	checkBodyVariableNumber : function checkBodyVariableNumber(body,variableName, minValue, maxValue) {
		var errors = [];

		if (body[variableName] === undefined || body[variableName].length < 1){
			errors.push({msg:variableName.charAt(0).toUpperCase() + variableName.slice(1)+' is missing', param:variableName, value:undefined});
		}
		if (Number.isNaN(body[variableName])) {
			errors.push({msg:variableName.charAt(0).toUpperCase() + variableName.slice(1)+' is a invalid number', param:variableName, value:undefined});
		} else if (body[variableName] < minValue || body[variableName] > maxValue) {
			errors.push({msg:variableName.charAt(0).toUpperCase() + variableName.slice(1)+' is a out of range',   param:variableName, value:body[variableName]});
		}

		if (errors.length > 0) {return errors;}
		return false;
	},

	checkTriggerActionBodyDate : function checkTriggerActionBodyDate(body)
	{
		var errors = [];
		errors = this.checkBodyVariableNumber(body, 'year' , 1970, 3000); if (errors.length > 0 ) {return errors;}
		errors = this.checkBodyVariableNumber(body, 'month', 0   , 11  ); if (errors.length > 0 ) {return errors;}
		errors = this.checkBodyVariableNumber(body, 'day'  , 1   , 31  ); if (errors.length > 0 ) {return errors;}
		return false;
	},

	checkTriggerActionBodyTime : function checkTriggerActionBodyTime(body)
	{
		var errors = [];
		errors = this.checkBodyVariableNumber(body, 'hour',   0, 23); if (errors.length > 0 ) {return errors;}
		errors = this.checkBodyVariableNumber(body, 'minute', 0, 59); if (errors.length > 0 ) {return errors;}
		errors = this.checkBodyVariableNumber(body, 'second', 0, 59); if (errors.length > 0 ) {return errors;}
		return false;
	},

	/**
	 * Checks body part of a request has all the required values to
	 * create a TriggerAction object of the type WEEKLY.
	 * Returns false if no errors found
	 * Returns array of error objects with a msg and a param part
	 * @param {Object} body The body of a post request to check 
	 */
	checkTriggerActionBodyWeekly : function checkTriggerActionBodyWeekly(body){
		if (body.weekdays === undefined){
			return [{msg:'No weekdays specified', param:'weekdays', value:undefined}];
		}
		var weekDays = body.weekdays.split(';');
		if (weekDays.length < 1){
			return [{msg:'Weekday missing, you need to specify at least one', param:'weekdays', value:undefined}];
		} 
		else {
			//we got some weekdays now wee need to check if all are in range 0 - 6
			var ok = false;
			var num,iError;
			for(var i = 0; i<weekDays.length; i++) {
				num = weekDays[i];
				ok = num > -1 && num < 7;
				if (!ok){
					iError = num;
					break;
				}
			}
			if (!ok){
				return[{msg:'Weekday is invalid', param:'weekdays', value:iError}];	
			}
			error = this.checkTriggerActionBodyTime(body);        if (error) { return error; }
			error = this.checkTriggerActionBodyUrl(body);         if (error) { return error; }
			error = this.checkTriggerActionBodyMethod(body);      if (error) { return error; }
			if (body.method !== 'GET') {
				error = this.checkTriggerActionBodyBody(body);    if (error) { return error; }
			}
			error = this.checkTriggerActionBodyDescription(body); if (error) { return error; }
			
		}
		//All values are valid
		return false;
	},
	
	/**
	 * Checks body part of a request has all the required values to
	 * create a TriggerAction object of the type ONES.
	 * Returns false if no errors found
	 * Returns array of error objects with a msg and a param part
	 * @param {Object} body The body of a post request to check 
	 */
	checkTriggerActionBodyOnes : function checkTriggerActionBodyOnes(body){
		var errors = [];
		error = this.checkTriggerActionBodyDate(body);        if (error) { return error; }
		error = this.checkTriggerActionBodyTime(body);        if (error) { return error; }
		error = this.checkTriggerActionBodyUrl(body);         if (error) { return error; }
		error = this.checkTriggerActionBodyMethod(body);      if (error) { return error; }
		if (body.method !== 'GET') {
			error = this.checkTriggerActionBodyBody(body);    if (error) { return error; }
		}
		error = this.checkTriggerActionBodyDescription(body); if (error) { return error; }
		
	
		//All values are valid
		return false;
	},

	
	/**
	 * Checks body part of a request has all the required values to
	 * create a TriggerAction object of the type LOG-INSTANT.
	 * Returns false if no errors found
	 * Returns array of error objects with a msg and a param part
	 * @param {Object} body The body of a post request to check 
	 */
	 checkTriggerActionBodyLogInstant : function checkTriggerActionBodyLogInstant(body){
		var errors = [];
		error = this.checkTriggerActionBodyUrl(body);         if (error) { return error; }
		error = this.checkTriggerActionBodyMethod(body);      if (error) { return error; }
		if (body.method !== 'GET') {
			error = this.checkTriggerActionBodyBody(body);    if (error) { return error; }
		}
		error = this.checkTriggerActionBodyDescription(body); if (error) { return error; }
		
	
		//All values are valid
		return false;
	},

	/**
	 * Checks body part of a request has all the required values to
	 * create a TriggerAction object of the type MONTHLY-LAST.
	 * Returns false if no errors found
	 * Returns array of error objects with a msg and a param part
	 * @param {Object} body The body of a post request to check 
	 */
	 checkTriggerActionBodyMonthlyLast : function checkTriggerActionBodyMonthlyLast(body){
		var errors = this.checkTriggerActionBodyOnes(body);
		if (errors){
			return errors;
		}


		errors = this.checkBodyVariableNumber(body, 'lastDay',   0, 30); if (errors.length > 0 ) {return errors;}
		
		//All values are valid
		return false;
	},

	/**
	 * Checks body part of a request has all the required values to
	 * create a TriggerAction object of the type TIMELY.
	 * Returns false if no errors found
	 * Returns array of error objects with a msg and a param part
	 * @param {Object} body The body of a post request to check 
	 */
	 checkTriggerActionBodyTimely : function checkTriggerActionBodyTimely(body){
		var errors = [];
		error = this.checkTriggerActionBodyTime(body);        if (error) { return error; }
		error = this.checkTriggerActionBodyUrl(body);         if (error) { return error; }
		error = this.checkTriggerActionBodyMethod(body);      if (error) { return error; }
		if (body.method !== 'GET') {
			error = this.checkTriggerActionBodyBody(body);    if (error) { return error; }
		}
		error = this.checkTriggerActionBodyDescription(body); if (error) { return error; }
		
	
		//All values are valid
		return false;
	},

	/**
	 * Checks if a body part of a post request has all the required values to
	 * create a TriggerAction object.
	 * @param {Object} body The body of a post request to check 
	 * @returns false if no errors found
	 * @returns Array of error objects with a msg and a param part
	 */
	areTriggerActionErrors : function areTriggerActionErrors(body){
		var errors = [];
		switch(body.type) {
			case 'LOG-INSTANT' : return this.checkTriggerActionBodyLogInstant(body);
			case 'WEEKLY'      : return this.checkTriggerActionBodyWeekly(body);
			case 'DAILY'       :
			case 'TIMELY'      : return this.checkTriggerActionBodyTimely(body);
			case 'YEARLY'      :
			case 'MONTHLY'     :
			case 'ONES'        : return this.checkTriggerActionBodyOnes(body);
			case 'MONTHLY-LAST': return this.checkTriggerActionBodyMonthlyLast(body);
			
		}
		return [{msg:'Type is missing or invalid', param:'type', value:undefined}];
	},
	/**
	 * creates a new TriggerAction object form req.body values.
	 * @param {Object} body req.body object 
	 * @returns a new TriggerAction object.  Returns undefined if unable to create the object from body values.
	 */
	newTriggerAction : function newTriggerAction(body){
		switch(body	.type) {
			case 'LOG-INSTANT':
			case "YEARLY":
			case 'MONTHLY': 
			case 'ONES': 
								
								return new TriggerAction({
															deviceId     : body.deviceId,
															destDeviceId : body.destDeviceId,
															type         : body.type,
															method       : body.method,
															url          : body.url,
															body         : body.body,
															description  : body.description,
															date         : new Date(Date.UTC(body.year, body.month, body.day,
																		  		body.hour, body.minute,body.second))
														});

			case 'MONTHLY-LAST':
									return new TriggerAction({
															deviceId     : body.deviceId,
															destDeviceId : body.destDeviceId,
															type         : body.type,
															method       : body.method,
															url          : body.url,
															body         : body.body,
															description  : body.description,
															dateData     : body.lastDay,
															date         : new Date(Date.UTC(body.year, body.month, body.day,
																				body.hour, body.minute,body.second))
														});

				case 'DAILY' :
				case 'TIMELY': 
									return new TriggerAction({
																deviceId     : body.deviceId,
																destDeviceId : body.destDeviceId,
																type         : body.type,
																method       : body.method,
																url          : body.url,
																body         : body.body,
																description  : body.description,
																date         : new Date(  ((Number(body.hour   ))*60*60*1000) +
																						  ((Number(body.minute ))   *60*1000) +
																						  ((Number(body.second ))      *1000)   )
															});
			case 'WEEKLY': 
								return new TriggerAction({
															deviceId     : body.deviceId,
															destDeviceId : body.destDeviceId,
															type         : body.type,
															method       : body.method,
															url          : body.url,
															body         : body.body,
															dateData     : body.weekdays,
															description  : body.description,
															date         : new Date(  ((Number(body.hour   ))*60*60*1000) +
																					  ((Number(body.minute ))   *60*1000) +
																					  ((Number(body.second ))      *1000)   )
															
															});
		}
	}
};  //utils

router.getTriggerAction = function getTriggerAction(){
	return TriggerAction;
};

router.getRegisterPage = function getRegisterPage(req, res, id){

	Device.listByOwnerId(req.user._id, function(err, deviceList){
		
		var arr = [];
		var item;
		var isOwner;
		for(var i = 0; i < deviceList.length; i++) {
			item = deviceList[i];
			isOwner = lib.findObjectID(item._doc.owners, req.user._id);

					arr.push({	name:deviceList[i].name, 
								description:deviceList[i].description,
								id:deviceList[i]._id,
								type:deviceList[i].type,
								url:deviceList[i].url,
								isOwner:isOwner
							});
		}
		var deviceStr = JSON.stringify(arr);
		if (id !== undefined){
			TriggerAction.getById(id, function(err, triggerAction){
				if (err || triggerAction === null) {
					req.flash('error',	'Could not find trigger action with id "' + id + '"' );
					res.redirect('/result');
				} else { 
					//success
					var triggerActionStr = JSON.stringify(TriggerAction.copyValues(triggerAction, false, false));
					res.render('register-triggeraction', 
								{
									devices:deviceStr,
									triggerActionId:id,
									triggerAction:triggerActionStr
								}
					);
				}
			});
		} else {
			res.render('register-triggeraction', {devices:deviceStr});
		}
	});
};

router.get('/register', lib.authenticatePowerUrl, function(req, res){
	router.getRegisterPage(req, res);
});

router.get('/register/:triggerActionId', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.triggerActionId;
	router.getRegisterPage(req, res, id);
});

//render a page with list of trigger actions
router.get('/list', lib.authenticateUrl, function (req, res) {
	res.render('list-triggeraction');
});
router.get('/list-all', lib.authenticateUrl, function (req, res) {
	res.render('list-devicetriggeraction-all');
});
//opens a page which shows trigger actions as a table for a specific device
router.get('/device/:deviceID', lib.authenticateRequest, function (req, res) {
	// todo: how to authenticate? now a logged in user can use all devices
	var deviceId = req.params.deviceID;

	if (deviceId === undefined) {
		res.status(422).json({ "error": "No device id provided!" });
	}
	else {

		Device.getById(deviceId, function (err, retDevice) {
			if (err || retDevice === null) {
				req.flash('error', 'Could not find device.');
				res.redirect('/result');
			} else {
				var device = {
					id: deviceId,
					name: retDevice._doc.name
				};
				res.render('list-devicetriggeraction', { item: device, device: JSON.stringify(device), deviceId: deviceId });
			}
		});
	}
});

//returns a Json object with all trigger actions from the specific device
router.get('/list/:deviceID', lib.authenticateRequest, function (req, res) {
	// todo: how to authenticate? now a monitorged in user can use all devices
	var deviceId = req.params.deviceID;

	if (deviceId === undefined) {
		res.status(422).json({ "error": "No device id provided!" });
	}
	else {
		TriggerAction.listByDeviceId(deviceId, function (err, data) {
			res.json(data);
		});
	}
});

/**
 * Finds a device name
 * @param {String} deviceId id of the device 
 * @param {Array} devices list of Mongoose Schema devices to search 
 * @returns Success: String containing the name of the device
 * @returns Fail: 'undefined'
 */
function getDeviceName(deviceId, devices){
	for(var i = 0; i<devices.length; i++){
		if (devices[i]._doc._id.equals(deviceId)) {
			return devices[i]._doc.name;
		}
	}
}

//returns a Json object with all trigger actions
router.get('/listall', lib.authenticateRequest, function (req, res) {
	Device.find({}, function(err, devices){
		if (err) {
			res.status(404).send('unable to find devices');
		} else {
			TriggerAction.list(function (err, triggerActions) {
				if (err) {
					res.status(404).send('unable to find trigger actions');
				} else {
					var name;
					triggerActions.forEach(triggerAction => {
							triggerAction._doc.deviceName = getDeviceName(triggerAction._doc.deviceId,devices);
							triggerAction._doc.destDeviceName = getDeviceName(triggerAction._doc.destDeviceId,devices);
					});
					res.json(triggerActions);
				}
			});
		}
	})
	
});


//listing all devices and which have trigger actions and return them as a json array
router.get('/device-list', lib.authenticatePowerRequest, function (req, res) {

	var monitorDevices = [];
	var saveData;
	TriggerAction.devicesMonitorCount(function (err, data) {
		if (err) { throw err; }
		monitorDevices = [];
		var i = 0;
		for (i = 0; i < data.length; i++) {
			monitorDevices.push({ id: data[i]._id.toString(), count: data[i].count });
			if (data.length == monitorDevices.length) {

				//now let's get device information about the devices
				Device.listByOwnerId(req.user._id, function (err, deviceList) {
					var arr = [];
					var item;
					var isOwner;
					for (var i = 0; i < deviceList.length; i++) {
						item = deviceList[i];
						var findId = item._id.toString();
						var monitorIndex = monitorDevices.map(function (e) { return e.id; }).indexOf(findId);
						if (monitorIndex > -1) {
							isOwner = lib.findObjectID(item._doc.owners, req.user._id);
							arr.push({
								name: deviceList[i].name,
								description: deviceList[i].description,
								id: deviceList[i]._id,
								type: deviceList[i].type,
								url: deviceList[i].url,
								isOwner: isOwner,
								recordCount: monitorDevices[monitorIndex].count
							});
						}
					}
					res.json(arr);
				});
			}
		} //for
	});
});


router.delete('/:triggerActionId', lib.authenticateDeviceOwnerRequest, function (req, res) {
	var id = req.params.triggerActionId;
	TriggerAction.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete trigger action "' + id + '".');
		} else {
			res.status(200).send('trigger action deleted.');
		}
	});
});

router.addTriggerAction = function addTriggerAction(req, res, id) {
	var newTriggerAction = utils.newTriggerAction(req.body);
	if ( id === undefined ) {
		TriggerAction.create(newTriggerAction, function (err, addedTriggerAction) {
			if (err) {
				res.status(500).json( [{msg:'Unable to add this trigger action to database!', param:'', value:undefined}]);
			 } else {
				res.status(200).json({success: "Trigger action created.",id: id});
			}
		});
	} else {
		TriggerAction.modify(id, TriggerAction.copyValues(newTriggerAction, false, false), function (err, result) {
			if (err || result === null || result.ok !== 1) {//(result.ok===1 result.nModified===1)
				req.flash('error', ' unable to update');
			} else {
				if (result.nModified === 0) {
					res.status(200).json({success: "Trigger action is unchanged",id: id});
				} else {
					res.status(200).json({success: "Trigger action updated.",id: id});
				}
				
			}
		});
	}
};

//todo how to set the timeout
router.getRequest = function (url, callback) {
	request.get(url, function (err, res, body) {
		if (res) {
			//we got responce
			callback(null, body);
		} else {
			callback(err, body);
		}
	});
};

/**
 * Gets all pins from a device
 * @param {String} device The id of the device
 * @param {function} callback function(error, ArrayOfAvailablePinObjects);  Error is null on success.
 */
router.getDevicePins = function getDevicePins(device, callback) {
	var urlid = device.url + '/pins';
	router.getRequest(urlid, function (err, body) {
		if (err || body === null) {
			callback(err, null);
		} else {
			var pinObject = JSON.parse(body);
			callback(err, pinObject.pins);
		}
	});
};

router.post('/register', lib.authenticatePowerRequest, function (req, res) {

	router.postRegistering(req, res);
});

router.post('/register/:triggerActionId', lib.authenticatePowerRequest, function (req, res) {

	router.postRegistering(req, res);
});

router.postRegistering = function postRegistering(req, res) {

	req.checkBody('type'       ,'Type is missing').notEmpty();
	req.checkBody('url'        ,'Url is missing').notEmpty();
	req.checkBody('description','description is required').notEmpty();
	var id = req.params.triggerActionId;
	var errors = req.validationErrors();
	if (!errors)
	{
		errors = utils.areTriggerActionErrors(req.body);
	}
	if (errors) {
		res.status(422).json(errors);
	} else {
		if (utilParser.areAnyDeviceTokens(req.body.url) || utilParser.areAnyDeviceTokens(req.body.body)) {
			Device.getById(req.body.deviceId, function (err, device) {
				if (err || device === null) {
					res.status(404).json( [{msg:'Device not found in database!', param:'deviceId', value:req.body.deviceId}]);
				} else if (utilParser.areAnyDevicePinTokens(req.body.url) || utilParser.areAnyDevicePinTokens(req.body.body)) {
					//Get device pins so se can check if the device has the pin number referred to in the token
					router.getDevicePins(device, function(err, pins){
						if (err) {
							var code = err.code!==undefined && err.code === 'ETIMEDOUT'? 408 : 404;
							res.status(code).json( [{msg:'Unable to connect to source device!' + ' ' + err.message, param:'deviceId', value:undefined}]);
						} else {
							var urlOk = true, bodyOk = true;
							if (utilParser.areAnyDeviceTokens(req.body.url)){
								urlOk = utilParser.areDevicePinsAvailable(req.body.url, pins);
							}
							if (utilParser.areAnyDeviceTokens(req.body.body)){
								bodyOk = utilParser.areDevicePinsAvailable(req.body.body, pins);
							}
							if (urlOk && bodyOk) {
								router.addTriggerAction(req, res, id);
							} else {
								var parameter = bodyOk === false? 'body': 'url';
								res.status(404).json( [{msg:'One or more PIN_VALUE token number reefer to a device pin which does not exist', param:parameter, value:undefined}]);
							}
						}
					});
				} else {
					router.addTriggerAction(req, res, id);
				}
					 
			});
		} else {
			//No need to check device values because there are no tokens referring ot it.
			router.addTriggerAction(req, res, id);
		}
	}
};

module.exports = router;
var express = require('express');
const validator = require('./validator.js');
const os = require('os');
const fs = require('fs');
var interfaces = os.networkInterfaces();
var Card = require('../models/card');
var Control = require('../models/control');
var Device = require('../models/device');
const exec = require('child_process').exec;
var defaultInterfaces = require('default-network');
var router = express.Router();

module.exports.authenticateUrl = function authenticateUrl(req, res, next){	
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
};
module.exports.publicFiles = function publicFiles(filename){
	if (filename === undefined){
		return false;
	}
	filename = filename.toLowerCase();
	switch(filename) {
		case "/readme.md"    : 
		case "/package.json" : return true;

		default              :
								if (filename.indexOf('/public/') === 0)	{
									return true;
								}
	}
	
	return false;
};

module.exports.authenticateFileRequest = function authenticateFileRequest(req, res, next){	
	if(req.isAuthenticated()){
		return next();
	} else {
		
		if (module.exports.publicFiles(req.query.name))
		{ 
			return next();
		} else {
			res.status(401).send('You do not have permission to view this file.');
		}
	}
};

module.exports.authenticatePowerUrl = function authenticatePowerUrl(req, res, next){	
	if(req.isAuthenticated() && req.user._doc.level > 0){
		return next();
	} else {
		req.flash('error_msg',	'You do not have power user rights and therefore cannot perform this action' );
		res.redirect('/result');
	}
};

module.exports.authenticateAdminUrl = function authenticateAdminUrl(req, res, next){	
	if(req.isAuthenticated() && req.user._doc.level > 1){
		return next();
	} else {
		req.flash('error_msg',	'You do not have administrator rights and therefore cannot perform this action' );
		res.redirect('/result');
	}
};

module.exports.authenticateCardUserUrl = function authenticateCardUserUrl(req, res, next){
	if(req.isAuthenticated()){
		if (req.user._doc.level > 1){
			return next(); //admins can do everything
		} else {
			var CardId = req.params.cardID;
			var userId = req.user._id;
			Card.getUserCardById(CardId, userId, function(err, result){
				if(err || result === null || result.length < 1) {
					req.flash('error_msg',	'You do not have permission to use this card.' );
					res.redirect('/result');
				} else {
					return next();
				}
			});
		}
	} else {
		req.flash('error_msg',	'You do not have permission to use this card and therefore cannot run it.' );
		res.redirect('/result');
	}
};

module.exports.authenticateCardOwnerUrl = function authenticateCardOwnerUrl(req, res, next){
	if(req.isAuthenticated()){
		if (req.user._doc.level > 1){
			return next();
		} else {
					var CardId = req.params.cardID;
					var userId = req.user._id;
					Card.getOwnerCardById(CardId, userId, function(err, result){
						if(err || result === null || result.length < 1) {
							req.flash('error_msg',	'You do not have permission to use this card.' );
							res.redirect('/result');
						} else {
							return next();
						}
					});
		}
		
	} else {

		req.flash('error_msg',	'You do not have permission to use this card  perform this action on this  it.' );
		res.redirect('/result');
	}
	
};


module.exports.authenticateCardOwnerRequest = function authenticateCardOwnerRequest(req, res, next){
	if(req.isAuthenticated()){
		if (req.user._doc.level > 1){
			return next();
		} else {
					var CardId = req.params.cardID;
					var userId = req.user._id;
					Card.getOwnerCardById(CardId, userId, function(err, result){
						if(err || result === null || result.length < 1) {
							res.status(401).send('You do not have permission perform this action on this card.');
						} else {
							return next();
						}
					});
		}
		
	} else {
		res.status(401).send('You do not have permission to use this card and therefore cannot perform this action.');
	}
};

module.exports.authenticateControlOwnerUrl = function authenticateControlOwnerUrl(req, res, next){
	if(req.isAuthenticated()){
		if (req.user._doc.level > 1){
			return next();
		} else {
					var ControlId = req.params.controlID;
					var userId = req.user._id;
					Control.getOwnerControlById(ControlId, userId, function(err, result){
						if(err || result === null || result.length < 1) {
							req.flash('error_msg',	'You do not have permission to use this control.' );
							res.redirect('/result');
						} else {
							return next();
						}
					});
		}
		
	} else {

		req.flash('error_msg',	'You do not have permission to use this control  perform this action on this .' );
		res.redirect('/result');
	}
	
};

module.exports.authenticateControlOwnerRequest = function authenticateControlOwnerRequest(req, res, next){
	if(req.isAuthenticated()){
		if (req.user._doc.level > 1){
			return next();
		} else {
				var ControlId = req.params.controlID;
				var userId = req.user._id;
				Control.getOwnerControlById(ControlId, userId, function(err, result){
					if(err || result === null || result.length < 1) {
						res.status(401).send('You do not have permission to perform this action on this control.');
					} else {
						return next();
					}
				});
		}
	} else {
		res.status(401).send('You do not have permission to use this control and therefore cannot perform this action.');
	}
};

module.exports.authenticateDeviceOwnerRequest = function authenticateDeviceOwnerRequest(req, res, next){
	if(req.isAuthenticated()){
		if (req.user._doc.level > 1){
			return next();
		} else {
				var DeviceId = req.params.deviceID;
				var userId = req.user._id;
				Device.getOwnerDeviceById(DeviceId, userId, function(err, result){
					if(err || result === null || result.length < 1) {
						res.status(401).send('You do not have permission to perform this action on this control.');
					} else {
						return next();
					}
				});
		}
	} else {
		res.status(401).send('You do not have permission to use this control and therefore cannot perform this action.');
	}
};

module.exports.authenticateDeviceOwnerUrl = function authenticateDeviceOwnerUrl(req, res, next){
	if(req.isAuthenticated()){
		if (req.user._doc.level > 1){
			return next();
		} else {
					var DeviceId = req.params.deviceID;
					var userId = req.user._id;
					Device.getOwnerDeviceById(DeviceId, userId, function(err, result){
						if(err || result === null || result.length < 1) {
							req.flash('error_msg',	'You do not have permission to use this device.' );
							res.redirect('/result');
						} else {
							return next();
						}
					});
		}
	} else {

		req.flash('error_msg',	'You do not have permission to use this device  perform this action on this .' );
		res.redirect('/result');
	}
};

module.exports.authenticateRequest = function authenticateRequest(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
			  res.statusCode = 401;
		return res.send('Error 401: You are not not authorized! ');
	}
};
module.exports.authenticatePowerRequest = function authenticatePowerRequest(req, res, next){

	if(req.isAuthenticated() && req.user._doc.level > 0){
		return next();
	} else {
			  res.statusCode = 401;
		return res.send('Error 401: You are not not authorized! ');
	}
};
module.exports.authenticateAdminRequest = function authenticateAdminRequest(req, res, next){

	if(req.isAuthenticated() && req.user._doc.level > 1){
		return next();
	} else {
			  res.statusCode = 401;
		return res.send('Error 401: You are not not authorized! ');
	}
};
module.exports.makeRequestPostOptions = function makeRequestOptions(url, formData){
	var byteLength = Buffer.byteLength(formData);
	var options = {
	url: url,
	method: 'POST',
	form: formData,
		
		headers: {
			'Content-Type': 'application/json',
			/*'Content-Type': 'application/x-www-form-urlencoded',*/
			'Content-Length': byteLength
		}
	};
	console.log("options");console.log(options);
	return options;
};


module.exports.setConfig = function setConfig(conf){
	var file = __dirname + './../config.json';
		var str = JSON.stringify(conf);
		//add an endline between variables
		str = str.replace(/,\"/g, ",\n\"");
		fs.writeFile(file, str, function(err) {
			if(err) {
				console.log("Could not write default values to the config file.  Error : " + err);
			} 
		});
};

module.exports.getConfig = function getConfig(){
	var file = __dirname + './../config.json';
	var conf;
	var makeNewFile = true;
	if (validator.fileExists(file)){
		try{
			conf = require(file);
			makeNewFile = false;
		} catch(e) {
			makeNewFile = true;
		}
	}
	if (makeNewFile === true){
		conf = { serverUrl : 'http://www.guttih.com:5100',
					port:6100,
					allowUserRegistration: true 
				};
		module.exports.setConfig(conf);

	}
	return conf;
};

//create a helper function, remove dubicates from ipaddresses
//create a helper function, remove prefix

module.exports.getAddresses = function getAddresses(removeDublicates){
	var addresses = [];
	for (var k in interfaces) {
		for (var k2 in interfaces[k]) {
			var address = interfaces[k][k2];
			if (address.family === 'IPv4' && !address.internal) {
				addresses.push(address.address);
			}
		}
	}

	if (removeDublicates){
		var i, end = addresses.length -2;
		for (i = end; i > -1; i--){
			if (addresses[i] === addresses[i+1]) { 
				addresses.splice(i-1,1);
			}
		}
	}
	return addresses;
};

// if you pass true as the parameter the function will remove all 
// addresses which are the same.
module.exports.getSubnets = function getSubnets(removeDublicates){
	var addresses = [];
	for (var k in interfaces) {
		for (var k2 in interfaces[k]) {
			var address = interfaces[k][k2];
			if (address.family === 'IPv4' && !address.internal) {
				addresses.push(address.netmask);
			}
		}
	}
	if (removeDublicates){
		var i, end = addresses.length -2;
		for (i = end; i > -1; i--){
			if (addresses[i] === addresses[i+1]) { 
				addresses.splice(i-1,1);
			}
		}
	}
	return addresses;
};




// returns a string array of the using statment
module.exports.extractUsingArray = function extractUsingArray(strCode){
	var line = strCode.replace(/\s\s+/g, ' ');
	var iStart, iStop;
	iStart = line.indexOf('var using =');
	if (iStart > -1) {iStart +=11; }
	else {
		iStart = line.indexOf('var using=');
		if (iStart === -1) {return; }
		iStart +=10;
	}
	iStop = line.indexOf(']', iStart);
	if (iStart === -1 ) {return; }
	line = line.substring(iStart, iStop+1);
	try {
		console.log(line);
		var obj = JSON.parse(line);
		return obj;
	} catch (e) {
		console.log("Invalid using statement.");
	}
};

// check if a userID is in array
module.exports.findObjectID = function findObjectID(array, objectID) {
	var ret = false;
	array.forEach(function(element) {
		if ( objectID.equals(element._doc._id) ){
			ret = true;
			return true;
		}
	}, this);
	return ret;
};

module.exports.getNetWorkInfo = function getNetWorkInfo(callback, callbackError) {
	
	network.get_active_interface(function(err, obj) {
 
		if (err !== null || obj === undefined || obj === null){
			if (callbackError !== undefined)
			{
				callbackError();
			}
		} else {
			callback(obj);
		}
  /* obj should be:
 
  { name: 'eth0',
    ip_address: '10.0.1.3',
    mac_address: '56:e5:f9:e4:38:1d',
    type: 'Wired',
    netmask: '255.255.255.0',
    gateway_ip: '10.0.1.1' }
 
  */
});
};

//calls dos command ipconfig and searches for the first match of a attribute
//you can f.example search for Default GateWay like this
/*
*/
module.exports.getFirstWindowsIpConfigValue = function getFirstWindowsIpConfigValue(strMatchMe, callback, callbackError){
		
	module.exports.getWindowsIpConfig(function(output){
		var str;
		output.forEach(function(item){

			var key = Object.keys(item)[0];
			str = item[key][strMatchMe];
			if (str !== undefined){
				callback(str);
				return;
			}
		}, this);
	}, callbackError);
};

module.exports.geKeyValueFromLine = function geKeyValueFromLine(element){
	if (element.length<1){
		return null;
	}
	var res = element.split(" : ", 2);
	if (res.length > 0 ){
		var i = res[0].indexOf(" .");
		var x = res[0].indexOf(". ");
		if (x > -1 && x < i) { i = x;}
		//x = res[0].indexOf("  .");
		if (i > 1){
			res[0]  = res[0].substring(0,i); 
		}
		var key = res[0].trim();
		var value = "";
		if (res.length > 1 && res[1].length){
			value = res[1];
		}
		return {key : key, value : value};
	}
	return null;
};

//reads first object from ipconfig output lines and returns it.
//when function has proccessed the object the lines from the array will be delteted. 
module.exports.getObjectFromLines = function getObjectFromLines(lineArray){
	
	if (lineArray.length < 4      || 
		lineArray[0].length !== 0 ||
		lineArray[2].length !== 0) {
		return null;
	}

	var i = 1;
	var key = lineArray[1].substring(0, lineArray[1].length-1);
	var obj = {};

	obj[key] = {};
	var i = 3, res, item;
	item = module.exports.geKeyValueFromLine(lineArray[i]);
	while(item){
		if (item.value.length>0){
			obj[key][item.key] = item.value;
		}
		i++;
		item = module.exports.geKeyValueFromLine(lineArray[i]);
	}
	lineArray.splice(0, i);
	return obj;
}
//runs the dos command ipconfig and returns all elements reported by it in a array.
module.exports.getWindowsIpConfig = function getWindowsIpConfig(callback, callbackError){
		
	var shellCommand = 'ipconfig';
	var gateways = [];
	var errStr;
	var objects;
		//running the dos command ipconfig, and parsing the result
		exec(shellCommand, function(err, out, code) {
			if (err !== null){
				errStr = ' : ' + err.message + 'Code : ' + err.code; 
				console.log(errStr);
				if (callbackError !== undefined){
					callbackError("Error extracting data from ipconfig!");//returns undefined
				}
			} else {
				
				var lines = out.split("\r\n");
				if (lines.length < 8 || lines[1] !== 'Windows IP Configuration') {
					if (callbackError){
						callbackError("unable to get output from ipconfig.");
						return;
					}
				}
				lines.splice(0, 3);
			
				var item = module.exports.getObjectFromLines(lines);
				if (item !== null ){
					objects = [];
					while(item !== null){
						objects.push(item);
						item = module.exports.getObjectFromLines(lines);	
					}
				}
				if (objects === undefined){
					if  (callbackError !== undefined){
							callbackError("Error extracting data from ipconfig!");
					}
				} else {
					callback(objects);
				}
			}
		});
};


module.exports.printWindowsIpConfig = function printWindowsIpConfig(output){
			output.forEach(function(item){
				var key = Object.keys(item)[0];
				console.log(key);
				var keys = Object.keys(item[key]);
				keys.forEach(function(subkey) {
					console.log("\t"+subkey+ '\t : \t' + item[key][subkey]);
				}, this);
			});
};


module.exports.getFirstDefaultGateWay = function getFirstDefaultGateWay(callback, callbackError){
	var ip;
	defaultInterfaces.collect(function(error, collectData) {
		
		if (error === null && collectData !== null) {
			 var keys = Object.keys(collectData);
			 if (keys.length > 0){
				var key = keys[0]; 
			 	ip = collectData[key][0].address;
			 }
		}
		 if (ip !== undefined && ip.length > 6) {
			 console.log("defaultInterfaces got the defaultIP");
		 	callback(ip);
		} else {
					var osStr = os.type();
					if (osStr.indexOf("Windows") === 0){
						
						module.exports.getFirstWindowsIpConfigValue("Default Gateway", function(gateway){
							if (gateway !== undefined ){
								ip = gateway;
								console.log("getWindwsDefaultGateways got the defaultIP");
								callback(ip);
							} else {
								if (callbackError !== undefined) {
									callbackError("unable to get windows default gateway.");
								}
							} 
						});
					} else{
						if (callbackError !== undefined) {
							callbackError("unable to get default gateway.");
						}
					}
				}
	});
};

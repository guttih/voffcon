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
const validator = require('./validator.js');
const os = require('os');
const fs = require('fs');
var interfaces = os.networkInterfaces();
var Card = require('../models/card');
var Control = require('../models/control');
var Device = require('../models/device');
const exec = require('child_process').exec;
var defaultInterfaces = require('default-network'); 
var ipconfig = require('../utils/ipconfigwin.js');
var router = express.Router();
var bcrypt = require('bcryptjs');


module.exports.getDeviceTypeName = function getDeviceTypeName(type) {
	switch(type){
		case "1" : return "Esp32 Development Module";
	}
	return "NodeMcu module with ESP8266 on board";
}

//returns undefined if not successful.
module.exports.makeHash = function makeHash(strHashMe) {
	
	if (strHashMe === undefined){
		return; 
	}
	var salt, hash;
	salt = bcrypt.genSaltSync(10);
	if (salt){
		hash = bcrypt.hashSync(strHashMe, salt);
	}
	return hash;
}

module.exports.compareHash = function(candidateId, hash){
	return bcrypt.compareSync(candidateId, hash);
};

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
								if (filename.indexOf('/public/') === 0 ||
									filename.indexOf('/docs/') === 0  )	{
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
module.exports.isUserOrDeviceAuthenticated = function isUserOrDeviceAuthenticated(req, deviceIp) {
	if(req.isAuthenticated()) {
		return true;
	} 
	
	if (req.connection !== undefined && req.connection !== null) {
		if (req.connection.remoteAddress !== undefined && req.connection.remoteAddress !== null) {
				return req.connection.remoteAddress.indexOf(deviceIp) > -1 ;
		}
	}

	return false;
};

module.exports.isPowerUserOrDeviceAuthenticated = function isPowerUserOrDeviceAuthenticated(req, deviceIp) {
	if(req.isAuthenticated() && req.user._doc.level > 0){
		return true;
	} 
	
	if (req.connection !== undefined && req.connection !== null) {
		if (req.connection.remoteAddress !== undefined && req.connection.remoteAddress !== null) {
				return req.connection.remoteAddress.indexOf(deviceIp) > -1 ;
		}
	}

	return false;
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
module.exports.makeRequestPostOptions = function makeRequestPostOptions(url, payload, method, ContentType){
	
	if (method === undefined ){
		method = 'POST';
	}
	if (ContentType === undefined ){
		ContentType = 'application/json';
	}
	var options = {
	url: url,
	method: method,
	form: payload,
		
		headers: {
			'Content-Type': ContentType,
			/*'Content-Type': 'application/x-www-form-urlencoded',*/
			'Content-Length': byteLength
		}
	};
	return options;
};
module.exports.makeRequestPostBodyOptions = function makeRequestPostBodyOptions(url, payload, method, ContentType){
	
	if (method === undefined ){
		method = 'POST';
	}
	if (ContentType === undefined ){
		ContentType = 'application/json';
	}
	var body = JSON.stringify(payload);
	var options = {
	url: url,
	method: method,
	body: body,
		
		headers: {
			'Content-Type': ContentType,
			/*'Content-Type': 'application/x-www-form-urlencoded',*/
			'Content-Length':  Buffer.byteLength(body)
		}
	};
	return options;
};


module.exports.setConfig = function setConfig(conf){
	var file = __dirname + '/../config.json';
		var str = JSON.stringify(conf);
		//add an endline between variables
		str = str.replace(/,\"/g, ",\n\"");
		fs.writeFile(file, str, function(err) {
			if(err) {
				console.log("Could not write default values to the config file.  Error : " + err);
			} 
		});
};

module.requireUncached = function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
};

module.exports.getConfig = function getConfig(unChased){
	var file = __dirname + '/../config.json';
	var conf;
	var makeNewFile = true;
	if (validator.fileExists(file)){
		try{
			if (unChased !== undefined && unChased === true) {
				conf = module.requireUncached(file);
			} else {
				conf = require(file);
			}
			makeNewFile = false;
		} catch(e) {
			makeNewFile = true;
		}
	}
	if (makeNewFile === true){
		conf = { 	port:6100,
					allowUserRegistration: true,
					importBasicControls:true 
				};
		module.exports.setConfig(conf);

	}
	return conf;
};

/**
 *Returns the file package.json as an object
 * @return An object representing values in the file
 * @example 
 * // Logging the version to the console.
 * var lib = require('./utils/glib');
 * var package = lib.getPackage();
 * console.log(package.version);
 */
module.exports.getPackage = function getPackage(){
	var file = __dirname + '/../package.json';
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
		conf = { 	port:6100,
					allowUserRegistration: true 
				};
		module.exports.setConfig(conf);

	}
	return conf;
};

//create a helper function, remove dubicates from ipaddresses
//create a helper function, remove prefix
// if putFirstLanAddressAtTop is false then addresses will be returned in an unchanged order
// if putFirstLanAddressAtTop is undefined or true the the first address that starts with "192.1" will be moved to index 0 in the returned array 

module.exports.getAddresses = function getAddresses(removeDublicates, putFirstLanAddressAtTop){
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
	if ( ( putFirstLanAddressAtTop === undefined || putFirstLanAddressAtTop === true ) && addresses.length > 1) {
		//lets put the first ip address which starts with 192. at the top of the address index
			
		var firstLanIndex = -1;
		for(var i = 0; i < addresses.length; i++){
				if (addresses[i].indexOf("192.") === 0){
					firstLanIndex = i;
					break; //break the for loop
				}
		}

		if (firstLanIndex > 0) {
			//the first ip address is not an lan address but i found another ip which is an lan address so I will
			//put the first first lan address in furst position
			var lanAddress = addresses[firstLanIndex];
			addresses[firstLanIndex] = addresses[0];
			addresses[0] = lanAddress;
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
						ipconfig.getFirstWindowsIpConfigValue("Default Gateway", function(gateway){
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

function getPort(url, assumePortIfMissing) {
	url = url.toLowerCase();
    url = url.match(/^(([a-z]+:)?(\/\/)?[^\/]+).*$/)[1] || url;
    var parts = url.split(':'),
        port = parseInt(parts[parts.length - 1], 10);
    if(assumePortIfMissing && ( parts[0] === 'http' && (isNaN(port) || parts.length < 3)) ) {
        return 80;
    }
    if(assumePortIfMissing && ( parts[0] === 'https' && (isNaN(port) || parts.length < 3)) ) {
        return 443;
    }
    if(assumePortIfMissing && ( parts.length === 1 || isNaN(port)) ) {
		return 80;
	}
    return port;
}


//returns undefined on error
module.exports.removeSchemaAndPortFromUrl = function removeSchemaAndPortFromUrl(url) {
	var retUrl;
	var to = url.lastIndexOf(':');
	var from = url.lastIndexOf('/');
	if (from < 0) { return; }
	if (to > -1 && to > from)
		retUrl = url.substring(from+1, to);
	else
		retUrl = url.substring(from+1);

	return retUrl;
}

//returns a valid ipv4 ip address
//returns undefined if url is invalid 
function getIpv4FromUrl(url) {
	//todo: think better about this function.... to quick and dirty
	url = url.replace("https://","");
	url = url.replace("http://","");
	url = url.replace("/","");
    url = url.match(/^(([a-z]+:)?(\/\/)?[^\/]+).*$/)[1] || url;
	if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(url)) {
		return url; //
	}
}

function dotsToCommas(str){
	var out = "";
	for(var i = 0; i < str.length; i++){
		if (str.charAt(i) === '.'){
			out = out + ','
		} else {
			out = out + str.charAt(i);
		}
	}
	return out;

}

//Replaces content in the string content, from where the
//startToken starts, including the startToken
//and the endToken ends, including the endToken
//Returns
//  Success: Returns a new string containing a new string where newSubContent has been replaced.
//  Fail   : Returns the string content unchanged.  This happens if the function did not find startToken or endToken.

module.exports.ReplaceInFile = function ReplaceInFile(content, newSubContent, startToken, endToken) {
    if (startToken === undefined) {
        startToken = "//DO_NOT_INSERT_FROM";
    }
    if (endToken === undefined) {
        endToken = "//DO_NOT_INSERT_TO";
    }

    var start = content.search(startToken);
    var end = content.search(endToken);
    if (start > -1 && end > start) {
        // getting the first part
        var out = content.substr(0, start);
        //adding the new content
        out += newSubContent;
        // getting the second part
        end += endToken.length;

        out += content.substr(end);
        return out;
    }
    return content;//unchanged
}


module.exports.getMode = function getMode(modeNumber) {
    switch(modeNumber){
		case 0: return "PINTYPE_INPUT_ANALOG";
		case 1: return "PINTYPE_INPUT_DIGITAL";
		case 2: return "PINTYPE_OUTPUT_ANALOG";
		case 3: return "PINTYPE_OUTPUT_DIGITAL";
		case 4: return "PINTYPE_OUTPUT_VIRTUAL";

		default: "INVALID_PIN_TYPE";
	}
}

//The function creates c++ commands to be able to setup the device pins using information from the given object.
//the function will return undefined if there was an error creating the the c++ commands
module.exports.makePinSetupString = function makePinSetupString(deviceType, pins) {
    
	if (deviceType !== "0" && deviceType !== "1" ) {
		return;
	}
	if (pins === undefined || pins.length < 1 || pins[0].pin === undefined || pins[0].m === undefined || pins[0].val === undefined || pins[0].name === undefined ){
		return;
	}
	
	var str, ret="";
	if (deviceType === "1") {
			ret = "uint8_t channel = 0;\r\n";
	}
	 
	//we should hav a valid array of pins.
	// devicePins.addPin("D0", type, 15, 1, 0);
	
	for(var i = 0; i<pins.length; i++){
		str ='    devicePins.addPin("' + pins[i].name + '", ' + module.exports.getMode(pins[i].m) + ', ' + pins[i].pin + ', ' + pins[i].val + ');\r\n';
		ret+= str;
	}
	return ret;
}

//The function creates c++ commands to be able to setup the device whitelist using information from the given object.
//the function will return undefined if there was an error creating the the c++ commands
module.exports.makeWhiteListSetupString = function makeWhiteListSetupString(whiteList) {
    
	if (whiteList === undefined || whiteList.length < 1 || whiteList[0].length < 0){
		return;
	}
	
	var bAdded=false, str, ret="\r\n";
	for(var i = 0; i<whiteList.length; i++){
		bAdded = true;
		str ='    whiteList.add("'+whiteList[i]+ '");\r\n';
		ret+= str;
	}
		
	return (bAdded)? ret: undefined; //return undefined if nothing was added
}



var makeProgramFileWindows = function makeProgramFileWindows(deviceId, whitelist, deviceUrl, deviceType, pins, callback, errorCallback) {
	
	var filePath = "./hardware/DeviceServerNodeMcu.ino";
	if (deviceType === "1") {
		filePath = "./hardware/DeviceServerEsp32.ino";
	}
	
	fs.readFile(filePath, "utf-8", function(err, file) {
			if (err === null){
				var config = module.exports.getConfig();
				//todo: extract these values for linux and windows also by creating a new function that
				//      returns only the needed values, which are IPV4_GATEWAY (default gateway) and IPV4_SUBNET (netmask)
				ipconfig.getWindowsIpConfig(function(netInfo){
					//PORT_NUMBER
					//IPV4_IPADDRESS
					//IPV4_GATEWAY
					//IPV4_SUBNET
					var serverIp = module.exports.getAddresses(true)[0];
					var port, ip, defaultGateWay, subNetMask;
					if (deviceUrl !== undefined && deviceUrl !== null){
						var tempPort = getPort(deviceUrl, false);
						if (!isNaN(tempPort)){ //a port is provided in the url
							
							deviceUrl = deviceUrl.replace(':' + tempPort, "");	//removing port
							
						} else{ //no port provided, we need to calculate it
							tempPort = getPort(deviceUrl, true);
						}
						ip = getIpv4FromUrl(deviceUrl);
						if (ip!== undefined){
							port = tempPort; //only get port number if ip is valid
						}
					}
					var i;
					for (i=0; i<netInfo.length; i++){
						var item = netInfo[i];
						var key = Object.keys(item)[0];
		
						var o = item[key];
						if (o["Default Gateway"]!== undefined &&
							o["IPv4 Address"]!== undefined &&
							o["Subnet Mask"]!== undefined ){

								defaultGateWay = o["Default Gateway"]; 
								subNetMask = o["Subnet Mask"];
								break;
						}
						/*
						var keys = Object.keys(item[key]);
						keys.forEach(function(subkey) {
							console.log("\t"+subkey+ '\t : \t' + item[key][subkey]);
							*/
						};
						if (deviceId!== undefined){
							file = file.replace('DEVICE_ID', '"'+deviceId+'"');
						}
						if (port!== undefined){
							file = file.replace("PORT_NUMBER", port);
						}
						if (ip!== undefined){
							ip = dotsToCommas(ip);
							file = file.replace("IPV4_IPADDRESS", ip);
						}
						if (defaultGateWay!== undefined){
							defaultGateWay = dotsToCommas(defaultGateWay);
							file = file.replace("IPV4_GATEWAY", defaultGateWay);
						}
						if (subNetMask!== undefined){
							subNetMask = dotsToCommas(subNetMask);
							file = file.replace("IPV4_SUBNET", subNetMask);
						}

						if (config.ssid!== undefined){
							file = file.replace("WIFI_ACCESSPOINT", '"' + config.ssid + '"');
						}
						if (config.ssidPwd!== undefined){
							file = file.replace("WIFI_PASSWORD", '"' + config.ssidPwd + '"');
						}
						if (config.serverIp === undefined){
							config.serverIp = serverIp;
						}
						if (config.serverIp!== undefined){
							var sip = dotsToCommas(config.serverIp);
							file = file.replace("VOFFCON_SERVER_IP", sip);
						}
						if (config.port!== undefined){
							file = file.replace("VOFFCON_SERVER_PORT", config.port);
						}

						if (pins !== undefined) {
							var strSetPinCppCommands = module.exports.makePinSetupString(deviceType, pins);
							file = module.exports.ReplaceInFile(file, strSetPinCppCommands, "//SETTING_UP_PINS_START", "//SETTING_UP_PINS_END");
						}
						if (whitelist !== undefined && whitelist.length  > 0) {
							var strWhiteListAddCppCommands = module.exports.makeWhiteListSetupString(whitelist);
							file = module.exports.ReplaceInFile(file, strWhiteListAddCppCommands, "//SETTING_UP_WHITELIST_START", "//SETTING_UP_WHITELIST_END");
						}
						
					callback(file);
				});
				
				
			} else{
				if (errorCallback){
					errorCallback("could read the program temlate");
				}
			}








	});
};
var getNetWorkInfoLinux = function getNetWorkInfoLinux(callback) {
	module.exports.getFirstDefaultGateWay(function(defaultGateway){
		var addresses = module.exports.getAddresses(true);
		var subnets = module.exports.getSubnets(true);
		var data={
			"defaultGateWay": defaultGateway,
			"subNetMask":subnets[0],
			"ip": addresses[0]
		}
		callback(data);
	});
}

var makeProgramFileLinux = function makeProgramFileLinux(deviceId, whitelist, deviceUrl, deviceType, pins, callback, errorCallback) {
	
	var filePath = "./hardware/DeviceServerNodeMcu.ino";
	if (deviceType === "1") {
		filePath = "./hardware/DeviceServerEsp32.ino";
	}
	fs.readFile(filePath, "utf-8", function(err, file) {
			if (err === null){
				var config = module.exports.getConfig();
				//todo: extract these values for linux and windows also by creating a new function that
				//      returns only the needed values, which are IPV4_GATEWAY (default gateway) and IPV4_SUBNET (netmask)
				getNetWorkInfoLinux(function(data){
					//PORT_NUMBER
					//IPV4_IPADDRESS
					//IPV4_GATEWAY
					//IPV4_SUBNET
					var port, ip, defaultGateWay, subNetMask, serverIp;
					
					defaultGateWay = data.defaultGateWay;
					subNetMask = data.subNetMask;
					serverIp = data.ip;
					if (deviceUrl !== undefined && deviceUrl !== null){
						var tempPort = getPort(deviceUrl, false);
						if (!isNaN(tempPort)){ //a port is provided in the url
							
							deviceUrl = deviceUrl.replace(':' + tempPort, "");	//removing port
							
						} else{ //no port provided, we need to calculate it
							tempPort = getPort(deviceUrl, true);
						}
						ip = getIpv4FromUrl(deviceUrl);
						if (ip!== undefined){
							port = tempPort; //only get port number if ip is valid
						}
					}
				
					if (deviceId!== undefined){
						file = file.replace('DEVICE_ID', '"'+deviceId+'"');
					}
					if (port!== undefined){
						file = file.replace("PORT_NUMBER", port);
					}
					if (ip!== undefined){
						ip = dotsToCommas(ip);
						file = file.replace("IPV4_IPADDRESS", ip);
					}
					if (defaultGateWay!== undefined){
						defaultGateWay = dotsToCommas(defaultGateWay);
						file = file.replace("IPV4_GATEWAY", defaultGateWay);
					}
					if (subNetMask!== undefined){
						subNetMask = dotsToCommas(subNetMask);
						file = file.replace("IPV4_SUBNET", subNetMask);
					}

					if (config.ssid!== undefined){
						file = file.replace("WIFI_ACCESSPOINT", '"' + config.ssid + '"');
					}
					if (config.ssidPwd!== undefined){
						file = file.replace("WIFI_PASSWORD", '"' + config.ssidPwd + '"');
					}
					if (config.serverIp === undefined){
						config.serverIp = serverIp;
					}
					if (config.serverIp!== undefined){
						var sip = dotsToCommas(config.serverIp);
						file = file.replace("VOFFCON_SERVER_IP", sip);
					}
					if (config.port!== undefined){
						file = file.replace("VOFFCON_SERVER_PORT", config.port);
					}
					if (pins !== undefined) {
							var strSetPinCppCommands = module.exports.makePinSetupString(deviceType, pins);
							file = module.exports.ReplaceInFile(file, strSetPinCppCommands, "//SETTING_UP_PINS_START", "//SETTING_UP_PINS_END");
					}
					if (whitelist !== undefined && whitelist.length  > 0) {
							var strWhiteListAddCppCommands = module.exports.makeWhiteListSetupString(whitelist);
							file = module.exports.ReplaceInFile(file, strWhiteListAddCppCommands, "//SETTING_UP_WHITELIST_START", "//SETTING_UP_WHITELIST_END");
					}
					callback(file);
				});
			} else{
				if (errorCallback){
					errorCallback("could read the program temlate");
				}
			}
	});
};
// gets the device-server program
module.exports.makeProgramFile = function makeProgramFile(device, callback, errorCallback) {
	//todo: join common code in makeProgramFileLinux and makeProgramFileWindows
	var osStr = os.type();
	if (osStr.indexOf("Windows") === 0){
		makeProgramFileWindows(device.id, device.whitelist, device. url, device.type, device.pins, callback, errorCallback);
	} else {
		makeProgramFileLinux(device.id, device.whitelist, device.url, device.type, device.pins, callback, errorCallback);
	}
};

module.exports.readFile = function readFile(filePath, callback) {
	
	fs.readFile(filePath, "utf-8", function(err, fileContent) {
		callback(err, fileContent);

	});
};
module.exports.makeValidFilename = function makeValidFilename(filename) {
	var filename = filename.replace(/[^A-Za-z0-9]/gi, '_');
	return filename;
	
};

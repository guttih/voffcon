var express = require('express');
const validator = require('./validator.js');
const os = require('os');
const fs = require('fs');
var interfaces = os.networkInterfaces();
var Card = require('../models/card');
var router = express.Router();

module.exports.authenticateUrl = function authenticateUrl(req, res, next){	
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
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
					req.flash('error_msg',	'You are not have permission to use this card.' );
					res.redirect('/result');
				} else {
					return next();
				}
			});
		}
	} else {
		req.flash('error_msg',	'You are not have permission to use this card and therefore cannot run it.' );
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
							req.flash('error_msg',	'You are not have permission to use this card.' );
							res.redirect('/result');
						} else {
							return next();
						}
					});
		}
		
	} else {

		req.flash('error_msg',	'You are not have permission to use this card and therefore cannot change it.' );
		res.redirect('/result');
	}
	
};

module.exports.authenticateControlOwnerUrl = function authenticateControlOwnerUrl(req, res, next){
	if(req.isAuthenticated()){
		if (req.user._doc.level > 1){
			return next();
		} else {
					var ControlId = req.params.ControlID;
					var userId = req.user._id;
					Control.getOwnerControlById(ControlId, userId, function(err, result){
						if(err || result === null || result.length < 1) {
							req.flash('error_msg',	'You are not have permission to use this control.' );
							res.redirect('/result');
						} else {
							return next();
						}
					});
		}
		
	} else {

		req.flash('error_msg',	'You are not have permission to use this control and therefore cannot change.' );
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

module.exports.getConfig = function getConfig(){
	var file = __dirname + './../config.json';
	console.log(file);
	var conf;
	if (validator.fileExists(file)){
		conf = require(file);
	}
	else{
		conf = { 'serverUrl' : 'http://www.guttih.com:5100' };
		var str = JSON.stringify(conf);
		fs.writeFile(file, str, function(err) {
			if(err) {
				return console.log("Could not write default values to the config file.  Error : " + err);
			}
		});
	}
	return conf;
};

module.exports.getAddresses = function getAddresses(){
	var addresses = [];
	for (var k in interfaces) {
		for (var k2 in interfaces[k]) {
			var address = interfaces[k][k2];
			if (address.family === 'IPv4' && !address.internal) {
				addresses.push(address.address);
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
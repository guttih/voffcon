var express = require('express');
const validator = require('./validator.js');
const os = require('os');
const fs = require('fs');
var interfaces = os.networkInterfaces();
var router = express.Router();

module.exports.authenticateUrl = function authenticateUrl(req, res, next){	
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
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
module.exports.makeRequestPostOptions = function makeRequestOptions(url, formData){
	var options = {
	url: url,
	method: 'POST',
	form: formData,
		
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(formData)
		}
	};
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
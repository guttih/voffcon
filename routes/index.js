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
const fs = require('fs');
var lib = require('../utils/glib');


// Get Homepage
router.get('/', lib.authenticateUrl, function(req, res){
	res.render('list-card');
	//res.render('index'); //todo: make nicer dashboard
});
router.get('/run/:cardID', lib.authenticateUrl, function(req, res){
	//for the dasboard
	var id = req.params.cardID;
	res.redirect('/cards/run/'+id);
	//res.render('index'); //todo: make nicer dashboard
});
router.get('/result', lib.authenticateUrl, function(req, res){
	res.render('result');
});
router.get('/about', function(req, res){
	res.render('about', {package:lib.getPackage()});
});
router.get('/help', function(req, res){
	res.render('help');
});
router.get('/licence', function(req, res){
	res.render('licence');
});
router.get('/help_development', function(req, res){
	res.render('help_development');
});
router.get('/settings-location', lib.authenticateAdminRequest, function(req, res){
	var item = {
		latitude : 0.00,
		longitude: 0.00
	};
	var geoLocation = lib.getConfig(true).geoLocation;
	
	if (geoLocation !== undefined) {
		item = geoLocation;
	}
	//var errors = {};
	res.render('settings-location',{ /*errors:errors,*/ geoLocation:JSON.stringify(item) });
});

router.get('/settings', lib.authenticateAdminRequest, function(req, res){
	var host = req.headers.host;
	if (host === undefined || host.toLowerCase().indexOf('localhost') !== 0) {
		return res.render('result', {error:"For security reasons this page can only be opened from localhost.  That is if the url starts with \"http://localhost\" or \"https://localhost\""});
	}
	var item = {
		port : '',
		ssid : '',
		ssidPwd: ''
	};
	var config = lib.getConfig(true);
	
	if (config !== undefined) {
		item.port = config.port       === undefined? '' : config.port,
		item.ssid = config.ssid       === undefined? '' : config.ssid,
		item.ssidPwd = config.ssidPwd === undefined? '' : config.ssidPwd;
	}
	//var errors = {};
	res.render('settings',{ /*errors:errors,*/ item:JSON.stringify(item) });
});

router.post('/settings', lib.authenticateAdminRequest, function(req, res){
	var body    = req.body;
	var port    = body.port    !== undefined && !isNaN(parseInt(body.port))? parseInt(body.port) : undefined;
	var ssid    = body.ssid    === undefined || body.ssid    ===''? undefined : body.ssid;
	var ssidPwd = body.ssidPwd === undefined || body.ssidPwd ===''? undefined : body.ssidPwd;

	if (port === undefined ) {
		res.status(422).send('Unable to save settings, port missing');
		return; 
	}

		var config = lib.getConfig(true);
		config.port = port;
		if (ssid !== undefined) {
			config.ssid = ssid;
		}
		if (ssidPwd !== undefined) {
			config.ssidPwd = ssidPwd;
		}
		lib.setConfig(config);
		res.status(200).send('settings saved.');

});

router.post('/settings-location', lib.authenticateAdminRequest, function(req, res){
	var body = req.body;
	var latitudeStr = body.latitude;
	var longitudeStr = body.longitude;
	var geoLocation, latitude, longitude;

	if (latitudeStr !== undefined && longitudeStr !== undefined) {
		latitude = parseFloat(latitudeStr);
		longitude = parseFloat(longitudeStr);
		if (!isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0) {
			geoLocation = {
				latitude:latitude,
				longitude:longitude
			};
		}
	}

	
	if (geoLocation !== undefined){
		var config = lib.getConfig(true);
		console.log("Ok, let's add location to config file.");
		config.geoLocation = geoLocation;
		lib.setConfig(config);
		res.status(200).send('Location saved.');
	} else {
		res.status(422).send('Unable to save location.');
	}
});


router.get('/message', function(req, res){
	var success = req.flash('success_msg');
	var krapp = req.session.krapp;
	success = krapp;
	if (success != undefined){
		res.render('message', {success_msg:success});
	} else {
		res.render('message');
	}
});


router.get('/file', lib.authenticateFileRequest, function(req, res){
	var name = req.query.name;
	var filename = __dirname + '/..' + name;
	fs.readFile(filename, 'utf8', function(err, data){
		var code = 200;
		if (err) {
			res.send(500).json({error:"Error reading file!"});
		} else{
			res.send(data);
		}
	});
	
	
});



//todo: this route shoud not be in users route, but a new route called maybe "settings"
router.post('/settings-allow-user-registration', lib.authenticateCardOwnerRequest, function(req, res){
	var allowUserRegistration = JSON.parse(req.body.allowUserRegistration);
	//read the config file into a variable.
	var str ='';
	var changes = 0;
	var config = lib.getConfig(true);
	if (allowUserRegistration !== undefined){
		console.log("Ok, let's add this value to the config file.");
		config.allowUserRegistration = allowUserRegistration;
		lib.setConfig(config);
		changes++;
	}
	if (changes > 0){
		res.status(200).send('Settings changed.');
	} else {
	// if all variables where missing return error
	//if was able to save return this
		res.status(422).send('Settings unchanged, no variables to change found.');
	}

});

module.exports = router;

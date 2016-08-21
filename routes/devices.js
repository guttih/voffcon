var express = require('express');
var router = express.Router();
var request = require('request');
var lib = require('../utils/glib');

var Device = require('../models/device');
var Card = require('../models/card');
var config = lib.getConfig();

//Hér á að búa til module fyrir queries á devices
//Öll köll til servera sem keyra á device ættu að vera hér.
//Þegar query er gert á device þá þarf url á devicesið að vera með 
//í query objectinu
router.get('/', lib.authenticateUrl, function(req, res){
	res.render('device');/*this is the views/device.handlebars*/
});

router.get('/register', lib.authenticateUrl, function(req, res){
			res.render('register-device');
});

// Get started time from a device
router.get('/started/:deviceId', lib.authenticateRequest, function(req, res){
	console.log(config);
	var deviceId = req.params.deviceId;
	//hér þarf að athuga hvort user eigi þetta device.
	//ef hann hefur aðgang að því þá þarf að sækja það og
	//sækja svo urlið úr því til að vista það sem SERVERURL
	console.log("got: "+deviceId);
	Device.getDeviceById(deviceId, function(err, device){
		if (err !== null){
			res.statusCode = 404;
			var obj = {text:'Error 404: User device not found!'};
			return res.json(obj);
		}
		var SERVERURL = device.url;
		console.log("SERVERURL:"+SERVERURL);
		//todo: put below in a sepperate function possible as a middleware
			request.get(SERVERURL+'/started',
					function (err, responce, body) {
						console.log("it ran");
						if (responce){
							console.log("statuscode:"+responce.statusCode);
						}
						
						if (err) {
							res.statusCode = 400;
							console.error(err);
							return res.json({text:"Unable to send request to device"});
							 
						}
						if (body){
							console.log(body);
						}
						return body;
					}
			).pipe(res);
		});
});
//todo: here we have a hardcoded SERVERURL, we need to change this
//this route needs to take a device ID like so router.get('/pins/:deviceID'...
router.get('/pins', lib.authenticateRequest, function(req, res){
	
	var SERVERURL = 'http://192.168.1.151:5100';
	var urlid = SERVERURL+'/pins';
	console.log(urlid);
	request.get(urlid,
				function (err, res, body) {
								if (res){
									console.log("statuscode:"+res.statusCode);
								}

							if (err) {
								return console.error(err);
							}
							if (body){
								console.log(body);
							}
							return body;
				}
		).pipe(res);
});

router.post('/pins', lib.authenticateRequest, function(req, res){
	var SERVERURL = 'http://192.168.1.151:5100';
	var urlid = SERVERURL+'/pins';

	var formData = {5: 500,
					0: 0,
					16: 16,
			4: 40,
					12: 120,
				13:130,
				15:900 };

		request(lib.makeRequestPostOptions(urlid, formData),
			function (err, res, body) {
					if (res){
						console.log("statuscode:"+res.statusCode);
					}

				if (err) {
					return console.error(err);
				}
				if (body){
					console.log(body);
				}
				return body;
			}
		).pipe(res);

});

router.get('/register', function(req, res){
	res.render('register-device');
});

// Register Device
router.post('/register', function(req, res){
	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('description', 'description is required').notEmpty();
	req.checkBody('url', 'url is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('register-device',{
			errors:errors
		});
	} else {
		var newDevice = new Device({
			name: req.body.name,
			url:req.body.url,
			description:req.body.description,
			owners:[]
			
		});
		newDevice.owners.push(req.user._id);
		
		console.log("newDevice");
		console.log(newDevice);

		Device.createDevice(newDevice, function(err, user){
			if(err) {throw err;}
			console.log(Device);
		});
		req.flash('success_msg', 'You have registered the device');

		res.redirect('/');
	}
});

router.get('/list', lib.authenticateRequest, function(req, res){
	Device.listDevicesByUserId(req.user._id, function(err, deviceList){
		
		var arr = [];
		for(var i = 0; i < deviceList.length; i++){
					arr.push({	name:deviceList[i].name, 
								url:deviceList[i].url,
								id:deviceList[i]._id});
		}
		res.json(arr);
	});

	//todo: create a card for testing
	var data = {
		name: "Test data",
		sub:{
			"val":10,
			"valname":"name of the value",
			arr:["This is a string one", "this is string two"]
		}
	};
	
});
module.exports = router;
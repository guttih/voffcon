var express = require('express');
var router = express.Router();
var request = require('request');
var lib = require('../utils/glib');

var Device = require('../models/device');
//var Card = require('../models/card');
var config = lib.getConfig();

//Hér á að búa til module fyrir queries á devices
//Öll köll til servera sem keyra á device ættu að vera hér.
//Þegar query er gert á device þá þarf url á devicesið að vera með 
//í query objectinu
router.get('/', lib.authenticateUrl, function(req, res){
	res.render('device');//this is the views/device.handlebars
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
	Device.getById(deviceId, function(err, device){
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
router.get('/pins/:deviceId', lib.authenticateRequest, function(req, res){
	var deviceId = req.params.deviceId;

	Device.getById(deviceId, function(err, device){
		if (err !== null){
			res.statusCode = 404;
			var obj = {text:'Error 404: User device not found!'};
			return res.json(obj);
		}

		
		var urlid = device._doc.url+'/pins';
		console.log(urlid);
		request.get(urlid,
					function (err, res, body) {
									if (res){
										console.log("get pins statuscode:"+res.statusCode);
									}

								if (err) {
									return console.error(err);
								}
								if (body){
								
								}
								return body;
					}
			).pipe(res);


});
});

router.post('/pins/:deviceId', lib.authenticateRequest, function(req, res){
	//var SERVERURL = 'http://192.168.1.154:5100';
	//var urlid = SERVERURL+'/pins';
	//var formData = {5: 999, 0: 999, 16: 999, 	4: 999, 	12: 999,	13:999,	15:999 };

	var deviceId = req.params.deviceId;
	var b = req.body;	
	Device.getById(deviceId, function(err, device){
		if (err !== null){
			res.statusCode = 404;
			var obj = {text:'Error 404: User device not found!'};
			return res.json(obj);
		}
	
			var urlid = device._doc.url+'/pins';					
			var formData = {};
			
			var keys = Object.keys(b);
			keys.forEach(function(key) {
					console.log(key+ ':' + b[key]);
					formData[key] = Number(b[key]);
				}, this);
			
			keys = Object.keys(formData);
			console.log("before delte");

				formData = JSON.stringify(formData);
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
				).pipe(res);}
	);
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


//listing all devices and return them as a json array
router.get('/device-list', lib.authenticatePowerRequest, function(req, res){
	Device.listByOwnerId(req.user._id, function(err, deviceList){
		
		var arr = [];
		var item;
		var isOwner;
		for(var i = 0; i < deviceList.length; i++){
			item = deviceList[i];
			isOwner = lib.findObjectID(item._doc.owners, req.user._id);

					arr.push({	name:deviceList[i].name, 
								description:deviceList[i].description,
								id:deviceList[i]._id,
								isOwner:isOwner
							});
		}
		res.json(arr);
	});
});


router.get('/item/:deviceID', lib.authenticateRequest, function(req, res){
	// todo: how to authenticate? now a logged in user can use all devices
	var id = req.params.deviceID;
	if (id !== undefined){
		Device.getById(id, function(err, device){
				if(err || device === null) {
					res.send('Error 404 : Not found! ');
				} else{
					res.json(device);
				}
			});
	}
});


//render a page with list of users
router.get('/list', lib.authenticateUrl, function(req, res){
	res.render('list-device');
});


router.delete('/:deviceID', lib.authenticateDeviceOwnerRequest, function(req, res){
	var id = req.params.deviceID;
	Device.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete device "' + id + '".');
		} else {
			res.status(200).send('Device deleted.');
		}
	});
	
});


//render a page wich runs a device, that is if the user is a registered user for that device (has access)

router.get('/useraccess/:deviceID', lib.authenticateDeviceOwnerUrl, function(req, res){
	var id = req.params.deviceID;
	Device.getById(id, function(err, retDevice){
		if(err || retDevice === null) {
			req.flash('error',	'Could not find device.' );
			res.redirect('/result');
		} else{
			var device = {
				id:id,
				name:retDevice._doc.name
			};
			res.render('useraccess_device', { device:device });
		}
	});
});


router.post('/useraccess/:deviceID', lib.authenticateDeviceOwnerRequest, function(req, res){
	
	var id = req.params.deviceID,
	owners = JSON.parse(req.body.owners);
	var values = { owners: owners };

		Device.modifyUserAccess(id, values, function(err, result){
		var code = 500;
		if(err) {//(result.ok===1 result.nModified===1)
			//res.send('Error 404 : Not found or unable to update! ');
			var msg = "Error modifying users access.";
			if (err.messageToUser !== undefined){
				msg += "<br/><br/>" + err.messageToUser;
				if (err.statusCode !== undefined){
					code = err.statusCode;
				}
			}
				res.status(code).send(msg);
		} else{
				res.status(200).send('Users access changed.');
		}
		
	});
});



module.exports = router;
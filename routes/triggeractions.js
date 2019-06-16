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


router.get('/register', lib.authenticatePowerUrl, function(req, res){
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
								type:deviceList[i].type,
								url:deviceList[i].url,
								isOwner:isOwner
							});
		}
					var str = JSON.stringify(arr);
		//res.json(arr);
		res.render('register-triggeraction', {devices:str});
	});
});

router.get('/register/:triggerActionId', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.triggerActionId;
	if (id !== undefined){
		TriggerAction.getById(id, function(err, device){
				if(err || device === null) {
					req.flash('error',	'Could not find trigger action.' );
					res.redirect('/result');
				} else{
					var obj = TriggerAction.copyValues(device);
					var str = JSON.stringify(obj);
					res.render('register-device', {devices:str});
				}
			});
	}
});

//render a page with list of trigger actions
router.get('/list', lib.authenticateUrl, function (req, res) {
	res.render('list-triggeraction');
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
				res.render('devicemonitor', { item: device, device: JSON.stringify(device), deviceId: deviceId });
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

router.delete('/list/:deviceId', lib.authenticateDeviceOwnerRequest, function (req, res) {
	var id = req.params.deviceId;

	Device.getById(id, function (err, device) {
		if (err || device === null) {
			return res.status(404).json({ 'error': 'Could not find device.' });

		} else {

			TriggerAction.listByDeviceId(id, function (err, list) {
				if (!err && list) {
					var pinsToRemove = [];
					list.forEach(element => {
						pinsToRemove.push(element.pin);
					});
					var deviceRoute = device._doc.url + '/monitors';
					request(lib.makeRequestPostBodyOptions(deviceRoute, pinsToRemove, 'DELETE'), function (delErr, delRes) {
						if (delErr) {
							console.log("Unable to delete device " + id);
						} else {
							console.log('DELETED device: ' + id);
						}
						if (delRes) {
							var monitors = JSON.parse(delRes.body);
							TriggerAction.deleteAllDeviceRecords(device.id, function (err) {
								if (err !== null) {
									res.status(410).json({ "error": "Unable to delete monitors from database" });
								} else {
									TriggerAction.saveMonitors(device.id, monitors, function (err) {
										if (err) {
											return res.status(400).json({ error: "Unable to save monitors to database" });
										} else {
											return res.status(200).json({
												success: "device monitors updated.",
												id: id
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
});

//listing all devices and which have monitors and return them as a json array
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


router.delete('/:monitorID', lib.authenticateDeviceOwnerRequest, function (req, res) {
	var id = req.params.monitorID;
	TriggerAction.getById(id, function (err, triggerAction) {
		if (err || triggerAction === null) {
			return res.status(404).json({ 'error': 'Could not find triggerAction.' });
		} else {
			Device.getById(triggerAction.deviceid, function (err, device) {
				if (err || device === null) {
					return res.status(404).json({ 'error': 'Could not find device.' });

				} else {
					var ipAddress = device._doc.url;
					ipAddress = lib.removeSchemaAndPortFromUrl(ipAddress);
					if (!lib.isUserOrDeviceAuthenticated(req, ipAddress)) {
						return res.status(404).json({ text: 'Error 404: You are not not authorized' });
					}

					var deviceRoute = device._doc.url + '/monitors';
					request(lib.makeRequestPostBodyOptions(deviceRoute, [triggerAction.pin], 'DELETE'), function (delErr, delRes) {
						if (delErr) {
							console.log("Unable to delete pin " + triggerAction.pin);
						} else {
							console.log('DELETED: ' + triggerAction.pin);
						}
						if (delRes) {
							var monitors = JSON.parse(delRes.body);
							TriggerAction.deleteAllDeviceRecords(device.id, function (err) {
								if (err !== null) {
									res.status(410).json({ "error": "Unable to delete monitors from database" });
								} else {
									TriggerAction.saveMonitors(device.id, monitors, function (err) {
										if (err) {
											return res.status(400).json({ error: "Unable to save monitors to database" });
										} else {
											return res.status(200).json({
												success: "device monitors updated.",
												id: id
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
});

// update the device monitors.  That is from server database to device memory
router.get('/update/:deviceId', function (req, res) {
	var deviceId = req.params.deviceId;

	Device.getById(deviceId, function (err, device) {
		if (err !== null || device === null) {
			console.log({ text: 'Error 404: User device not found!' });
		}

		var ipAddress = device.url;
		ipAddress = lib.removeSchemaAndPortFromUrl(ipAddress);
		if (!lib.isPowerUserOrDeviceAuthenticated(req, ipAddress)) {
			console.log({ text: 'Error 404: You are not not authorized' });
		}
		TriggerAction.listByDeviceIdAndCleanObjects(deviceId, function (err, data) {
			console.log(data);


			var deviceRoute = device.url + '/monitors';
			//we need to delete the older triggerAction on the device
			request(lib.makeRequestPostBodyOptions(deviceRoute, data, 'POST'), function (updateErr, updateResult) {
				if (updateErr) {
					console.log("Unable to update monitors ");
				} else {
					console.log('Monitors updated');
					TriggerAction.deleteAllDeviceRecords(deviceId, function (err) {
						if (err !== null || !updateResult) {
							console.log({ "error": "Unable to delete monitors from database" });
						} else {
							var monitors = JSON.parse(updateResult.body);
							TriggerAction.saveMonitors(deviceId, monitors, function (err) {
								if (err) {
									console.log({ error: "Unable to save monitors to database" });
								} else {
									console.log({ success: "device monitors updated." });
								}
							});
						}
					});
				}

			}).pipe(res);
		});
	});
});

module.exports = router;
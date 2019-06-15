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
var Monitor = require('../models/monitor');
var Device = require('../models/device');

router.get('/ids/:deviceId', function (req, res) {
	var id = req.params.deviceId;
	var isValid = false;
	var error = "You must provide an device id!";
	if (id !== undefined) {
		isValid = Monitor.isObjectIdStringValid(id);
		error = "invalid device id provided!";
	}
	if (isValid) {

		Monitor.listByDeviceId(id, function (err, items) {
			if (err) {
				req.flash('error_msg', err.message);
				//throw err;

			} else {
				var str = JSON.stringify(items);
				req.flash('success_msg', str);
			}
			res.redirect('/message');
		});

	} else {
		req.flash('error', error);

	}
});

var getRequest = function (url, callback) {
	request.get(url, function (err, res, body) {
		if (res) {
			//we got the pinvalues, so let's save them
			callback(null, body);
		} else {
			callback(err, body);
		}
	});
};
/**
 * Gets all pins from a device and removes the ones that have already
 * A monitor connected to them.
 * @param {String} device The id of the device
 * @param {int} addThisPin If you want a pin to exitst, even though it is connected to a monitor, provide it here.  Pass null if you do not want to exclude any pin.
 * @param {function} callback function(error, ArrayOfAvailablePinObjects);  Error is null on success.
 */
router.getAvailableMonitorPins = function getAvailableMonitorPins(device, addThisPin, callback) {
	var urlid = device.url + '/pins';
	getRequest(urlid, function (err, body) {
		if (err || body === null) {
			callback(err, null);
		} else {
			var pinObject = JSON.parse(body);
			var allPins = pinObject.pins;
			allPins.push({ pin: -1, val: 0, m: 0, name: 'Timer' });
			var pinsToRemove = [];

			//Find all pins in use
			Monitor.listByDeviceId(device.id, function (err, list) {
				if (!err && list) {
					//removing pins in use, except the addThisPin
					list.forEach(element => {
						if (addThisPin === null || addThisPin !== element.pin) {
							pinsToRemove.push(element.pin);
						}
					});
				}
				//Excluding all pins that are in use
				var availablePins = allPins.filter(m => {
					return !pinsToRemove.includes(m.pin);
				});
				callback(err, availablePins);
			});
		}
	});
};

router.get('/register/:deviceID', lib.authenticateDeviceOwnerRequest, function (req, res) {
	var deviceId = req.params.deviceID;
	if (deviceId != undefined) {
		Device.getById(deviceId, function (err, device) {
			if (err || device === null) {
				req.flash('error', 'Could not find device.');
				res.redirect('/result');
			} else {
				var ipAddress = device._doc.url;
				ipAddress = lib.removeSchemaAndPortFromUrl(ipAddress);
				if (!lib.isUserOrDeviceAuthenticated(req, ipAddress)) {
					res.statusCode = 404;
					return res.json({ text: 'Error 404: You are not not authorized' });
				}

				var newDevice = {
					id: device._id,
					name: device.name,
					description: device.description,
					owners: device.owners,
					type: device.type,
					url: device.url
				};
				router.getAvailableMonitorPins(newDevice, null, function (err, availablePins) {
					if (err || availablePins === null) {
						req.flash('error', 'Could not get device pins.');
						res.redirect('/result');
					} else {

						newDevice.pins = availablePins;
						//todo: Next, we need to exclude all pins that have monitors
						res.render('register-monitor', {
							device: JSON.stringify(newDevice),
							deviceName: newDevice.name,
							deviceId: newDevice.id
						});
					}
				});
			}
		});
	}
});

router.get('/register/:deviceId/:monitorId', lib.authenticatePowerUrl, function (req, res) {
	var deviceId = req.params.deviceId;
	var id = req.params.monitorId;

	if (deviceId != undefined) {
		Device.getById(deviceId, function (err, device) {
			if (err || device === null) {
				req.flash('error', 'Could not find device.');
				res.redirect('/result');
			}
			else {
				var ipAddress = device._doc.url;
				ipAddress = lib.removeSchemaAndPortFromUrl(ipAddress);
				if (!lib.isUserOrDeviceAuthenticated(req, ipAddress)) {
					res.statusCode = 404;
					return res.json({ text: 'Error 404: You are not not authorized' });
				}

				var newDevice = {
					id: device._id,
					name: device.name,
					description: device.description,
					owners: device.owners,
					type: device.type,
					url: device.url
				};
				if (id !== undefined) {
					Monitor.getById(id, function (err, monitor) {
						if (err || monitor === null) {
							req.flash('error', 'Could not find monitor.');
							res.redirect('/result');
						} else {

							router.getAvailableMonitorPins(newDevice, monitor.pin, function (err, availablePins) {
								if (err || availablePins === null) {
									req.flash('error', 'Could not get device pins.');
									res.redirect('/result');
								} else {
									var newMonitor = {
										deviceId: monitor.deviceid,
										pin: monitor.pin,
										minLogInterval: monitor.minLogInterval,
										pinValueMargin: monitor.pinValueMargin,
										sampleInterval: monitor.sampleInterval,
										sampleTotalCount: monitor.sampleTotalCount,
									};
									newDevice.pins = availablePins;
									//todo: Next, we need to exclude all pins that have monitors
									res.render('register-monitor', {
										device: JSON.stringify(newDevice),
										deviceName: newDevice.name,
										deviceId: newDevice.id,
										monitor: JSON.stringify(newMonitor),
										monitorId: id
									});
								}
							});
						}
					});
				}
			}
		});
	}
});

//monitors device pin status to the database
router.post('/register/:deviceID', lib.authenticateDeviceOwnerRequest, function (req, res) {

	req.checkBody('pin', 'pin number is missing').isInt({ gt: -2, lt: 40 });
	//req.checkBody('description', 'description is required').notEmpty();

	var pinNumber = req.body.pin;
	if (pinNumber !== undefined && pinNumber === '-1') {
		req.checkBody('minLogInterval', 'minLogInterval is missing').isNumeric({ gt: -1, lt: 1024 });
	} else { // not a timer, so we will need to verify all values
		req.checkBody('minLogInterval', 'minLogInterval is missing').isNumeric({ gt: -1, lt: 1024 });
		req.checkBody('pinValueMargin', 'pinValueMargin is missing').isNumeric({ gt: -1 });
		req.checkBody('sampleInterval', 'sampleInterval is missing').isNumeric({ gt: -1 });
		req.checkBody('sampleTotalCount', 'sampleTotalCount is missing').isInt({ gt: -1 });
	}

	var deviceID = req.params.deviceID;
	var errors = req.validationErrors();

	if (errors) {
		res.status(422).json(errors);
	} else {
		var newMonitor = {
			minLogInterval: Number(req.body.minLogInterval),
			pin: Number(req.body.pin)
		};
		if (pinNumber !== '-1') {
			newMonitor['pinValueMargin'] = Number(req.body.pinValueMargin);
			newMonitor['sampleInterval'] = Number(req.body.sampleInterval);
			newMonitor['sampleTotalCount'] = Number(req.body.sampleTotalCount);
		}
		Device.getById(deviceID, function (err, device) {
			if (err || device === null) {
				//res.status(404).json(err);
				res.status(404).json({ "error": "Device not found in database!" });
			} else {
				var deviceRoute = device._doc.url + '/monitors';
				router.updateDeviceAndDatabase(res, deviceID, deviceRoute, newMonitor);
			}
		});
	}
});

router.post('/register/:deviceId/:monitorId', lib.authenticateDeviceOwnerRequest, function (req, res) {

	req.checkBody('pin', 'pin number is missing').isInt({ gt: -2, lt: 40 });
	//req.checkBody('description', 'description is required').notEmpty();

	var pinNumber = req.body.pin;
	if (pinNumber !== undefined && pinNumber === '-1') {
		req.checkBody('minLogInterval', 'minLogInterval is missing').isNumeric({ gt: -1, lt: 1024 });
	} else { // not a timer, so we will need to verify all values
		req.checkBody('minLogInterval', 'minLogInterval is missing').isNumeric({ gt: -1, lt: 1024 });
		req.checkBody('pinValueMargin', 'pinValueMargin is missing').isNumeric({ gt: -1 });
		req.checkBody('sampleInterval', 'sampleInterval is missing').isNumeric({ gt: -1 });
		req.checkBody('sampleTotalCount', 'sampleTotalCount is missing').isInt({ gt: -1 });
	}

	var deviceID = req.params.deviceId;
	var id = req.params.monitorId;
	var errors = req.validationErrors();

	if (errors) {
		res.status(422).json(errors);
	} else {
		var newMonitor = {
			minLogInterval: Number(req.body.minLogInterval),
			pin: Number(req.body.pin)
		};
		if (pinNumber !== '-1') {
			newMonitor['pinValueMargin'] = Number(req.body.pinValueMargin);
			newMonitor['sampleInterval'] = Number(req.body.sampleInterval);
			newMonitor['sampleTotalCount'] = Number(req.body.sampleTotalCount);
		}
		Device.getById(deviceID, function (err, device) {
			if (err || device === null) {
				//res.status(404).json(err);
				res.status(404).json({ "error": "Device not found in database!" });
			} else {
				if (id !== undefined) {
					Monitor.getById(id, function (err, monitor) {
						if (err || monitor === null) {
							req.flash('error', 'Could not find monitor.');
							res.redirect('/result');
						} else {
							var deviceRoute = device._doc.url + '/monitors';
							if (monitor.pin !== newMonitor.pin) {
								//we need to delete the older monitor on the device
								request(lib.makeRequestPostBodyOptions(deviceRoute, [monitor.pin], 'DELETE'), function (delErr, delRes) {
									if (delErr) {
										console.log("Unable to delete pin " + monitor.pin);
									} else {
										console.log('DELETED: ' + monitor.pin);
									}
									router.updateDeviceAndDatabase(res, deviceID, deviceRoute, newMonitor);
								});
							} else {
								router.updateDeviceAndDatabase(res, deviceID, deviceRoute, newMonitor);
							}
						}
					}); //onitor.getById
				}
			}
		});
	}
});

router.updateDeviceAndDatabase = function updateDeviceAndDatabase(res, deviceID, deviceRoute, newMonitor) {
	request(lib.makeRequestPostBodyOptions(deviceRoute, newMonitor, 'POST'),
		function (err, deviceRes, body) {
			if (deviceRes) {
				console.log("statuscode:" + deviceRes.statusCode);
			}
			if (err) {
				return console.error(err);
			}
			if (body) {
				var monitors = JSON.parse(body);
				Monitor.deleteAllDeviceRecords(deviceID, function (err) {
					if (err !== null) {
						res.status(410).json({ "error": "Unable to delete monitors from database" });
					} else {
						Monitor.saveMonitors(deviceID, monitors, function (err) {
							if (err) {
								res.status(400).json({ error: "Unable to save monitors to database" });
							} else {
								res.status(200).json({ success: "device monitors updated." });
							}
						});
					}
				});
			}
		}
	);//request
}

//render a page with list of monitors
router.get('/list', lib.authenticateUrl, function (req, res) {
	res.render('list-monitor');
});
//opens a page which shows monitors as a table for a specific device
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

//returns a Json object with all monitors from the specific device
router.get('/list/:deviceID', lib.authenticateRequest, function (req, res) {
	// todo: how to authenticate? now a monitorged in user can use all devices
	var deviceId = req.params.deviceID;

	if (deviceId === undefined) {
		res.status(422).json({ "error": "No device id provided!" });
	}
	else {
		Monitor.listByDeviceId(deviceId, function (err, data) {
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

			Monitor.listByDeviceId(id, function (err, list) {
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
							Monitor.deleteAllDeviceRecords(device.id, function (err) {
								if (err !== null) {
									res.status(410).json({ "error": "Unable to delete monitors from database" });
								} else {
									Monitor.saveMonitors(device.id, monitors, function (err) {
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
	Monitor.devicesMonitorCount(function (err, data) {
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
	Monitor.getById(id, function (err, monitor) {
		if (err || monitor === null) {
			return res.status(404).json({ 'error': 'Could not find monitor.' });
		} else {
			Device.getById(monitor.deviceid, function (err, device) {
				if (err || device === null) {
					return res.status(404).json({ 'error': 'Could not find device.' });

				} else {
					var ipAddress = device._doc.url;
					ipAddress = lib.removeSchemaAndPortFromUrl(ipAddress);
					if (!lib.isUserOrDeviceAuthenticated(req, ipAddress)) {
						return res.status(404).json({ text: 'Error 404: You are not not authorized' });
					}

					var deviceRoute = device._doc.url + '/monitors';
					request(lib.makeRequestPostBodyOptions(deviceRoute, [monitor.pin], 'DELETE'), function (delErr, delRes) {
						if (delErr) {
							console.log("Unable to delete pin " + monitor.pin);
						} else {
							console.log('DELETED: ' + monitor.pin);
						}
						if (delRes) {
							var monitors = JSON.parse(delRes.body);
							Monitor.deleteAllDeviceRecords(device.id, function (err) {
								if (err !== null) {
									res.status(410).json({ "error": "Unable to delete monitors from database" });
								} else {
									Monitor.saveMonitors(device.id, monitors, function (err) {
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
		Monitor.listByDeviceIdAndCleanObjects(deviceId, function (err, data) {
			console.log(data);


			var deviceRoute = device.url + '/monitors';
			//we need to delete the older monitor on the device
			request(lib.makeRequestPostBodyOptions(deviceRoute, data, 'POST'), function (updateErr, updateResult) {
				if (updateErr) {
					console.log("Unable to update monitors ");
				} else {
					console.log('Monitors updated');
					Monitor.deleteAllDeviceRecords(deviceId, function (err) {
						if (err !== null || !updateResult) {
							console.log({ "error": "Unable to delete monitors from database" });
						} else {
							var monitors = JSON.parse(updateResult.body);
							Monitor.saveMonitors(deviceId, monitors, function (err) {
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
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
var config = lib.getConfig();

var Device = require('../models/device');


router.get('/', lib.authenticateUrl, function(req, res) {
    res.redirect("/devices/list");
});


// Get started time from a device
router.get('/started/:deviceId', lib.authenticateRequest, function(req, res) {
    var deviceId = req.params.deviceId;
    //todo: hér þarf kanski að athuga hvort user eigi þetta device.
    //ef hann hefur aðgang að því þá þarf að sækja það og
    //sækja svo urlið úr því til að vista það sem SERVERURL
    console.log("got: " + deviceId);
    Device.getById(deviceId, function(err, device) {
        if (err !== null) {
            res.statusCode = 404;
            var obj = { text: 'Error 404: User device not found!' };
            return res.json(obj);
        }
        var SERVERURL = device.url;
        console.log("SERVERURL:" + SERVERURL);
        //todo: put below in a sepperate function possible as a middleware
        request.get(SERVERURL + '/started',
            function(err, responce, body) {
                console.log("it ran");
                if (responce) {
                    console.log("statuscode:" + responce.statusCode);
                }

                if (err) {
                    res.statusCode = 400;
                    console.error(err);
                    return res.json({ text: "Unable to send request to device" });

                }
                if (body) {
                    console.log(body);
                }
                return body;
            }
        ).pipe(res);
    });
});

router.get('/status/:deviceId', lib.authenticateRequest, function(req, res) {
    var deviceId = req.params.deviceId;
    //todo: hér þarf kanski að athuga hvort user eigi þetta device.
    //ef hann hefur aðgang að því þá þarf að sækja það og
    //sækja svo urlið úr því til að vista það sem SERVERURL
    console.log("got: " + deviceId);
    Device.getById(deviceId, function(err, device) {
        if (err !== null) {
            res.statusCode = 404;
            var obj = { text: 'Error 404: User device not found!' };
            return res.json(obj);
        }
        var SERVERURL = device.url;
        console.log("SERVERURL:" + SERVERURL);
        //todo: put below in a sepperate function possible as a middleware
        request.get(SERVERURL + '/status',
            function(err, responce, body) {
                console.log("it ran");
                if (responce) {
                    console.log("statuscode:" + responce.statusCode);
                }

                if (err) {
                    res.statusCode = 400;
                    console.error(err);
                    return res.json({ text: "Unable to send request to device" });

                }
                if (body) {
                    console.log(body);
                }
                return body;
            }
        ).pipe(res);
    });
});

//todo: here we have a hardcoded SERVERURL, we need to change this
//this route needs to take a device ID like so router.get('/pins/:deviceID'...
router.get('/pins/:deviceId', lib.authenticateRequest, function(req, res) {
    var deviceId = req.params.deviceId;

    Device.getById(deviceId, function(err, device) {
        if (err !== null || device === null) {
            res.statusCode = 404;
            var obj = { text: 'Error 404: User device not found!' };
            return res.json(obj);
        }

        var urlid = device._doc.url + '/pins';
        console.log(urlid);
        request.get(urlid,
            function(err, res, body) {
                if (res) {
                    console.log("get pins statuscode:" + res.statusCode);
                }

                if (err) {
                    return console.error(err);
                }
                return body;
            }
        ).pipe(res);
    });
});

router.get('/pinout/:deviceId', lib.authenticateRequest, function(req, res) {
    var deviceId = req.params.deviceId;

    Device.getById(deviceId, function(err, device) {
        if (err !== null || device === null) {
            res.statusCode = 404;
            var obj = { text: 'Error 404: User device not found!' };
            return res.json(obj);
        }

        var urlid = device._doc.url + '/pinout';
        console.log(urlid);
        request.get(urlid,
            function(err, res, body) {
                if (res) {
                    console.log("get pinout statuscode:" + res.statusCode);
                }

                if (err) {
                    return console.error(err);
                }
                if (body) {

                }
                return body;
            }
        ).pipe(res);
    });
});

//this route needs to take a device ID like so router.get('/custom/:deviceID'...
router.get('/custom/:deviceId', lib.authenticateRequest, function(req, res) {
    var deviceId = req.params.deviceId;

    Device.getById(deviceId, function(err, device) {
        if (err !== null || device === null) {
            res.statusCode = 404;
            var obj = { text: 'Error 404: User device not found!' };
            return res.json(obj);
        }

        var urlid = device._doc.url + '/custom';
        console.log(urlid);
        request.get(urlid,
            function(err, res, body) {
                if (res) {
                    console.log("get pins statuscode:" + res.statusCode);
                }

                if (err) {
                    return console.error(err);
                }
                if (body) {

                }
                return body;
            }
        ).pipe(res);
    });
});

/////////////////// google assistant IFTTT BEGIN /////////////////////
function MakeIftttMakerWebhookTriggerUrl(event, key) {
    return `https://maker.ifttt.com/trigger/${event}/with/key/${key}`;
}

router.post('/google/pins/:deviceId', function(req, res) {
    var reqBody = req.body;
    router.jsonRequestToDevice(res, req.params.deviceId, req.body, '/pins', 'POST',
        function(err, res, body) {
            if (res) {
                console.log("statuscode:" + res.statusCode);
            }

            if (err) {
                return console.error(err);
            }
            if (body) {
                //todo: remove this line
                var triggeringEvent;
                if (reqBody['5'] !== undefined) {
                    triggeringEvent = 'filling_hottub';
                } else if (reqBody['4'] !== undefined) {
                    triggeringEvent = 'draining_hottub';
                }

                if (triggeringEvent !== undefined) {
                    var triggerUrl = MakeIftttMakerWebhookTriggerUrl(triggeringEvent, config.iftttToken);
                    request(lib.makeRequestPostBodyOptions(triggerUrl, reqBody),
                        function(err, res, body) {
                            if (res) {
                                console.log("statuscode: " + res.statusCode);
                            }

                            if (err) {
                                return console.error(err);
                            }
                            if (body) {
                                console.log(body);
                                console.log("email sent.");
                            }
                            //return body;
                        }
                    );
                }
            }
            //return body;
        }, true);

});

router.post('/google/custom/:deviceId', function(req, res) {
    var reqBody = req.body;
    console.log(reqBody);
    router.jsonRequestToDevice(res, req.params.deviceId, req.body, '/custom', 'POST',
        function(err, res, body) {
            if (res) {
                console.log("statuscode:" + res.statusCode);
            }

            if (err) {
                return console.error(err);
            }
            return body;
        }, true);

});
/////////////////// google assistant IFTTT END /////////////////////

router.detectNumeric = function detectNumeric(obj) {
    for (var index in obj) {
        if (!isNaN(obj[index])) {
            obj[index] = Number(obj[index]);
        } else if (typeof obj === "object") {
            detectNumeric(obj[index]);
        } else if (Array.isArray(obj)) {
            console.log("Array");
            console.log(index);

        }
    }
}

router.jsonRequestToDevice = function jsonRequestToDevice(res, deviceId, postBody, subUrl, httpMethod, callback, checkIfTttToken) {

    Device.getById(deviceId, function(err, device) {
        if (err !== null || device === null) {
            res.statusCode = 404;
            var obj = { text: 'Error 404: User device not found!' };
            if (callback !== undefined) {
                callback(err, null);
            }
            return res.json(obj);
        }

        //Deep copy;
        let newObj = JSON.parse(JSON.stringify(postBody));

        //Change string stored as numbers into numbers.
        router.detectNumeric(newObj);
        if (checkIfTttToken !== undefined && checkIfTttToken === true) {
            var urlKey = newObj.urlKey;

            if (urlKey === undefined || config.iftttToken !== urlKey) {
                res.statusCode = 404;
                var message = 'urlKey missing or wrong.';
                console.log(message);
                var obj = { text: message };
                if (callback !== undefined) {
                    callback(err, null);
                }
                return res.json(obj);
            }
            delete newObj['urlKey'];
        }
        var urlid = device._doc.url + subUrl;
        var contentType = 'application/json';
        request(lib.makeRequestPostBodyOptions(urlid, newObj, httpMethod, contentType),
            function(err, res, body) {
                if (callback !== undefined) {
                    callback(err, res, body);
                }
                return body; //todo: why return body? do I need this
            }
        ).pipe(res);
    });
};

router.post('/custom/:deviceId', lib.authenticateRequest, function(req, res) {
    router.jsonRequestToDevice(res, req.params.deviceId, req.body, '/custom', 'POST',
        function(err, res, body) {
            if (err) {
                console.error("error custom posting");
            } else {
                console.log("succsess custom posting")
            }
        });
});
router.delete('/custom/:deviceId', lib.authenticateRequest, function(req, res) {
    router.jsonRequestToDevice(res, req.params.deviceId, req.body, '/custom', 'DELETE',
        function(err, res, body) {
            if (err) {
                console.error("error custom posting");
            } else {
                console.log("succsess custom deleteing")
            }
        });
});

router.post('/pins/:deviceId', lib.authenticateRequest, function(req, res) {
    router.jsonRequestToDevice(res, req.params.deviceId, req.body, '/pins', 'POST');
});

router.post('/whitelist/:deviceId', lib.authenticatePowerRequest, function(req, res) {
    router.jsonRequestToDevice(res, req.params.deviceId, req.body, '/whitelist', 'POST');
});
router.delete('/whitelist/:deviceId', lib.authenticatePowerRequest, function(req, res) {
    router.jsonRequestToDevice(res, req.params.deviceId, req.body, '/whitelist', 'DELETE');
});


router.post('/custom/:deviceId', lib.authenticateRequest, function(req, res) {
    //var formData = {5: 999, 0: 999, 16: 999, 	4: 999, 	12: 999,	13:999,	15:999 };
    router.jsonRequestToDevice(res, req.params.deviceId, req.body, '/custom', 'POST');
});

router.get('/register', lib.authenticatePowerUrl, function(req, res) {
    res.render('register-device');
});

router.get('/register/:deviceID', lib.authenticatePowerUrl, function(req, res) {
    var id = req.params.deviceID;
    if (id !== undefined) {
        Device.getById(id, function(err, device) {
            if (err || device === null) {
                req.flash('error', 'Could not find device.');
                res.redirect('/result');
            } else {
                var obj = {
                    id: id,
                    name: device.name,
                    description: device.description,
                    url: device.url,
                    type: device.type
                };
                var str = JSON.stringify(obj);
                res.render('register-device', { device: str });
            }
        });
    }
});

// Register Device
router.post('/register', lib.authenticatePowerRequest, function(req, res) {
    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('description', 'description is required').notEmpty();
    req.checkBody('url', 'url is required').notEmpty();
    req.checkBody('type', 'Device type is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.status(422).json(errors);
    } else {
        var newDevice = new Device({
            name: req.body.name,
            url: req.body.url,
            description: req.body.description,
            type: req.body.type,
            owners: []

        });
        newDevice.owners.push(req.user._id);

        console.log("newDevice");
        console.log(newDevice);

        Device.createDevice(newDevice, function(err, user) {
            if (err) { throw err; }
            console.log(Device);
        });
        req.flash('success_msg', 'You have registered the device');

        res.redirect('/');
    }
});

router.post('/register/:deviceID', lib.authenticatePowerRequest, function(req, res) {
    var id = req.params.deviceID;
    req.checkBody('url', 'url is required').notEmpty();
    req.checkBody('description', 'description is required').notEmpty();
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('type', 'Device type is required').notEmpty();



    var errors = req.validationErrors();

    if (errors) {
        res.status(422).json(errors);

    } else {
        var values = {
            name: req.body.name,
            description: req.body.description,
            url: req.body.url,
            type: req.body.type
        };
        Device.modify(id, values, function(err, result) {
            if (err || result === null || result.ok !== 1) { //(result.ok===1 result.nModified===1)
                //res.send('Error 404 : Not found or unable to update! ');
                req.flash('error', ' unable to update');
            } else {
                if (result.nModified === 0) {
                    req.flash('success_msg', 'Device is unchanged!');
                } else {
                    req.flash('success_msg', 'Device updated!');
                }
            }
            res.redirect('/devices/run/' + id);
        });
    }
});

//listing all devices and return them as a json array
router.get('/device-list-all', lib.authenticateAdminRequest, function(req, res) {
    Device.list(function(err, deviceList) {

        var arr = [];
        var item;
        for (var i = 0; i < deviceList.length; i++) {
            item = deviceList[i];
            arr.push({
                name: deviceList[i].name,
                id: deviceList[i]._id,
                type: deviceList[i].type,
                url: deviceList[i].url,
            });
        }
        res.json(arr);
    });
});

router.get('/device-list', lib.authenticatePowerRequest, function(req, res) {
    Device.listByOwnerId(req.user._id, function(err, deviceList) {

        var arr = [];
        var item;
        var isOwner;
        for (var i = 0; i < deviceList.length; i++) {
            item = deviceList[i];
            isOwner = lib.findObjectID(item._doc.owners, req.user._id);

            arr.push({
                name: deviceList[i].name,
                description: deviceList[i].description,
                id: deviceList[i]._id,
                type: deviceList[i].type,
                url: deviceList[i].url,
                isOwner: isOwner
            });
        }
        res.json(arr);
    });
});



router.get('/item/:deviceID', lib.authenticateRequest, function(req, res) {
    // todo: how to authenticate? now a logged in user can use all devices
    var id = req.params.deviceID;
    if (id !== undefined) {
        Device.getById(id, function(err, device) {
            if (err || device === null) {
                res.send('Error 404 : Not found! ');
            } else {
                res.json(device);
            }
        });
    }
});

//render a page with list of users
router.get('/list', lib.authenticateUrl, function(req, res) {
    res.render('list-device');
});
//render a page with list of users
router.get('/list-all', lib.authenticateAdminUrl, function(req, res) {

    Device.list(function(err, deviceList) {

        var arr = [];
        var item;
        for (var i = 0; i < deviceList.length; i++) {
            item = deviceList[i];
            arr.push({
                name: deviceList[i].name,
                id: deviceList[i]._id,
                type: deviceList[i].type,
                url: deviceList[i].url,
                number: i + 1
            });
        }
        // http://192.168.1.79:6100/css/bootstrap.css
        res.render('list-device-all',

            {
                stringifyedDevices: JSON.stringify(arr),
                devices: arr,
                deviceCount: 33,
                style: 'list-devices-all.css',
            });
    });
});

router.delete('/:deviceID', lib.authenticateDeviceOwnerRequest, function(req, res) {
    var id = req.params.deviceID;
    Device.delete(id, function(err, result) {
        if (err !== null) {
            res.status(404).send('unable to delete device "' + id + '".');
        } else {
            res.status(200).send('Device deleted.');
        }
    });

});

//render a page wich runs a device, that is if the user is a registered user for that device (has access)
router.get('/useraccess/:deviceID', lib.authenticateDeviceOwnerUrl, function(req, res) {
    var id = req.params.deviceID;
    Device.getById(id, function(err, retDevice) {
        if (err || retDevice === null) {
            req.flash('error', 'Could not find device.');
            res.redirect('/result');
        } else {
            var device = {
                id: id,
                name: retDevice._doc.name
            };
            res.render('useraccess_device', { device: device });
        }
    });
});


router.post('/useraccess/:deviceID', lib.authenticateDeviceOwnerRequest, function(req, res) {

    var id = req.params.deviceID,
        owners = JSON.parse(req.body.owners);
    var values = { owners: owners };

    Device.modifyUserAccess(id, values, function(err, result) {
        var code = 500;
        if (err) { //(result.ok===1 result.nModified===1)
            //res.send('Error 404 : Not found or unable to update! ');
            var msg = "Error modifying users access.";
            if (err.messageToUser !== undefined) {
                msg += "<br/><br/>" + err.messageToUser;
                if (err.statusCode !== undefined) {
                    code = err.statusCode;
                }
            }
            res.status(code).send(msg);
        } else {
            res.status(200).send('Users access changed.');
        }

    });
});

// render a page wich runs a diagnostic device, for a device, if the user is a registered user for that device (has access)
router.get('/run/:deviceID', lib.authenticateDeviceOwnerUrl, function(req, res) {
    var id = req.params.deviceID;
    Device.getById(id, function(err, retDevice) {
        if (err || retDevice === null) {
            req.flash('error', 'Could not find device.');
            res.redirect('/result');
        } else {
            var type = "0";
            if (retDevice._doc.type !== undefined) {
                type = retDevice._doc.type;
            }
            var nameOfType = lib.getDeviceTypeName(type);
            var device = {
                id: id,
                name: retDevice._doc.name,
                url: retDevice._doc.url,
                description: retDevice._doc.description,
                type: type,
                typeName: nameOfType
            };
            var str = JSON.stringify(device);
            res.render('run-device', { device: str, deviceId: device.id });
        }
    });
});

router.post('/program/:deviceID', lib.authenticatePowerUrl, function(req, res) {
    var id = req.params.deviceID;
    var b = req.body;
    var pins, whitelist;
    if (req.body.pins !== undefined) {
        pins = JSON.parse(req.body.pins);
    }
    if (req.body.whitelist !== undefined) {
        whitelist = JSON.parse(req.body.whitelist);
    }
    if (id !== undefined) {
        Device.getById(id, function(err, device) {
            if (err || device === null) {
                req.flash('error', 'Could not find device.');
                res.redirect('/result');
            } else {
                var type = device.type;
                if (type === undefined) {
                    type = "0";
                }
                var dev = {
                    id: id,
                    url: device.url,
                    type: device.type,
                    pins: pins,
                    whitelist: whitelist
                }
                lib.makeProgramFile(dev, function(data) {
                        var fileInfo = "attachment; filename=DeviceServerNodeMcu.ino";
                        if (device.type === "1") {
                            fileInfo = "attachment; filename=DeviceServerEsp32.ino";
                        }
                        res.writeHead(200, {
                            'Content-Type': 'application/force-download',
                            'Content-disposition': fileInfo
                        });
                        /*'Content-disposition':'attachment; filename=device_server.ino'});*/
                        res.end(data);
                    },
                    function(str) {
                        req.flash('error', 'Could not read program file.');
                        res.redirect('/result');
                    });
            }
        });
    }
});

router.post('/reportin', function(req, res) {

    req.checkBody('id', 'id is required').notEmpty();
    req.checkBody('ip', 'ip is required').notEmpty();
    req.checkBody('port', 'port is required').notEmpty();
    var id = req.body.id;
    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
    } else {
        var newUrl = "http://" + req.body.ip + ":" + req.body.port;
        Device.getById(id, function(err, device) {
            if (err || device === null) {
                res.status(412).json({ message: "device not found!" });
            } else {
                if (newUrl !== device.url) {
                    //url is change so let's update the device in the database
                    var obj = {
                        id: device.id,
                        name: device.name,
                        description: device.description,
                        url: newUrl,
                        type: device.type
                    };
                    Device.modify(id, obj, function(err, result) {
                        if (err || result === null || result.ok !== 1) { //(result.ok===1 result.nModified===1)
                            res.status(500).json({ message: "Unable to update!" });
                        } else {
                            var date = new Date();
                            res.status(200).send(date.toUTCString());
                        }
                    });
                } else { //url is unchanged
                    var date = new Date();
                    res.status(200).send(date.toUTCString());
                }
            }
        });
    }
});

module.exports = router;
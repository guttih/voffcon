/*
        Ardos is a system for controlling devices and appliances from anywhere.
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

var DeviceLogItem = require('../models/devicelogitem');



router.get('/ids/:deviceId', function(req, res){
	var id = req.params.deviceId;
	var isValid=false;
	var error = "You must provide an device id!";
	if (id !== undefined){
		isValid = DeviceLogItem.isObjectIdStringValid(id);
		error = "invalid device id provided!";
	}
	if (isValid){
		/*DeviceLogItem.logInformation('57e2a6f74a43074811a0720f','Þessi texti á að vistast þriðji', function(err, item){
				if(err) {throw err;}
				console.log(item);
		});*/
		DeviceLogItem.listByDeviceId(id, function(err, items){
			if(err) {
				req.flash('error_msg', err.message);
				//throw err;
				
			} else {
				var str = JSON.stringify(items);
					req.flash('success_msg', str);
					
			}
			res.redirect('/message');
		});
		
	} else {
		req.flash('error',	error );
		
	}
});

router.post('/pins', function(req, res){
	
	req.checkBody('pins', 'pins are required').notEmpty();
	req.checkBody('deviceId', 'deviceId is required').notEmpty();
	req.checkBody('type', 'type is required').notEmpty();
	req.checkBody('type', 'type must be OBJECTTYPE_LOG_PINS').isInt();
	var errors = req.validationErrors();
	
	if(!errors){
		if (req.body.type !== 8 ){ //todo: check how to use the validator to check if a number is 8
			errors = {error:"type must be OBJECTTYPE_LOG_PINS"};
		} else if (!DeviceLogItem.isObjectIdStringValid(req.body.deviceId)) {
			errors = {error:"Invalid device id provided!"};
		}
	}

	if(errors){
		res.status(422).json(errors);
	} else {
			var deviceId = req.body.deviceId;
			var strPins = JSON.stringify(req.body.pins);
			DeviceLogItem.logInformation(deviceId ,strPins, function(err, item) {
					if(err) {throw err;}
					console.log(item);
					res.status(200).json({message: "logging succeded!"});
			});
	}
});

module.exports = router;
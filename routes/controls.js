var express = require('express');
var router = express.Router();
var request = require('request');
var lib = require('../utils/glib');
var Control = require('../models/control');
var config = lib.getConfig();

//Hér á að búa til module fyrir queries á devices
//Öll köll til servera sem keyra á device ættu að vera hér.
//Þegar query er gert á device þá þarf url á devicesið að vera með 
//í query objectinu
router.get('/', lib.authenticateUrl, function(req, res){
	res.render('index-control');
});
router.get('/register', function(req, res){
	res.render('register-control');
});

router.post('/register', lib.authenticatePowerRequest, function(req, res){
	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('description', 'description is required').notEmpty();
	req.checkBody('template', 'a html template is required').notEmpty();
	req.checkBody('code', 'javascript code is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		//todo: user must type all already typed values again, fix that
		res.render('register-control',{errors:errors	});
	} else {
				var newControl = new Control({
					name			: req.body.name,
					description	: req.body.description,
					template		: req.body.template,
					code			: req.body.code,
					owners:[]
			});
			newControl.owners.push(req.user._id);
			//todo: update if control already exists
			Control.createControl(newControl, function(err, control){
				if(err) {throw err;}
				console.log("control created:");
				console.log(control);
			});

			req.flash('success_msg',	'You successfully created the ' + 
										newControl._doc.name + ' control' );
			//todo: redirect to what?
			
			res.redirect('/result');
	}
});

router.get('/list', lib.authenticateUrl, function(req, res){
	res.render('list-control');
});

router.get('/item/:controlID', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.controlID;
	console.log(id);
	res.render('result', {error:'todo: call register controller page with params'});
});
router.get('/b', lib.authenticatePowerUrl, function(req, res){
	
	res.render('list-control');
});

/*listing all devices and return them as a json array*/
router.get('/control-list', lib.authenticateRequest, function(req, res){
	Control.listControlsByOwnerId(req.user._id, function(err, controlList){
		
		var arr = [];
		for(var i = 0; i < controlList.length; i++){
					arr.push({	name:controlList[i].name, 
								description:controlList[i].description,
								id:controlList[i]._id});
		}
		res.json(arr);
	});
});
module.exports = router;
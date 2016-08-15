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
module.exports = router;
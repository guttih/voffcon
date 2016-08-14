var express = require('express');
var router = express.Router();
var request = require('request');
var lib = require('../utils/glib');
var Controller = require('../models/controller');
var config = lib.getConfig();

//Hér á að búa til module fyrir queries á devices
//Öll köll til servera sem keyra á device ættu að vera hér.
//Þegar query er gert á device þá þarf url á devicesið að vera með 
//í query objectinu
router.get('/', lib.authenticateUrl, function(req, res){
	res.render('index-controller');
});
router.get('/register', function(req, res){
	res.render('register-controller');
});
router.post('/register', lib.authenticatePowerRequest, function(req, res){
	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('description', 'description is required').notEmpty();
	req.checkBody('template', 'a html template is required').notEmpty();
	req.checkBody('code', 'javascript code is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('register-controller',{errors:errors	});
	} else {
				var newController = new Controller({
					name			: req.body.name,
					description	: req.body.description,
					template		: req.body.template,
					code			: req.body.code,
					owners:[]
			});
			newController.owners.push(req.user._id);
			console.log("todo: uncomment");
			console.log(newController._doc);
			Controller.createController(newController, function(err, controller){
				if(err) {throw err;}
				console.log("controller created:");
				console.log(controller);
			});

			req.flash('success_msg',	'You successfully created the ' + 
										newController._doc.name + ' controller' );
			res.redirect('/controllers/register');
	}
});
module.exports = router;
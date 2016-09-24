var express = require('express');
var router = express.Router();
var lib = require('../utils/glib');


// Get Homepage
router.get('/', lib.authenticateUrl, function(req, res){
	res.render('index');
});
router.get('/result', lib.authenticateUrl, function(req, res){
	res.render('result');
});
router.get('/about', function(req, res){
	res.render('about');
});
router.get('/help', function(req, res){
	res.render('help');
});


//todo: this route shoud not be in users route, but a new route called maybe "settings"
router.post('/settings', lib.authenticateCardOwnerRequest, function(req, res){
	var allowUserRegistration = JSON.parse(req.body.allowUserRegistration);
	//read the config file into a variable.
	var str ='';
	var changes = 0;
	var config = lib.getConfig();
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
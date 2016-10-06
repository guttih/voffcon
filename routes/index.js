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
const fs = require('fs');
var lib = require('../utils/glib');


// Get Homepage
router.get('/', lib.authenticateUrl, function(req, res){
	res.render('list-card');
	//res.render('index'); //todo: make nicer dashboard
});
router.get('/run/:cardID', lib.authenticateUrl, function(req, res){
	//for the dasboard
	var id = req.params.cardID;
	res.redirect('/cards/run/'+id);
	//res.render('index'); //todo: make nicer dashboard
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
router.get('/licence', function(req, res){
	res.render('licence');
});
router.get('/help_development', function(req, res){
	res.render('help_development');
});


router.get('/file', lib.authenticateFileRequest, function(req, res){
	var name = req.query.name;
	var filename = __dirname + '/..' + name;
	fs.readFile(filename, 'utf8', function(err, data){
		var code = 200;
		if (err) {
			res.send(500).json({error:"Error reading file!"});
		} else{
			res.send(data);
		}
	});
	
	
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

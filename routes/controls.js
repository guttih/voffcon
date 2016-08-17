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
router.get('/register', lib.authenticatePowerUrl, function(req, res){
			res.render('register-control');
});
router.get('/register/:controlID', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.controlID;
	if (id !== undefined){
		Control.getById(id, function(err, control){
				if(err || control === null) {
					req.flash('error',	'Could not find control.' );
					res.redirect('/result');
				} else{
					var obj = {id : id,
						name: control.name};
					var str = JSON.stringify(obj);
					res.render('register-control', {item:str});
				}
			});
		
	}

});

router.post('/register', lib.authenticatePowerRequest, function(req, res){
	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('description', 'description is required').notEmpty();
	req.checkBody('template', 'a html template is required').notEmpty();
	req.checkBody('code', 'javascript code is required').notEmpty();
	var errors = req.validationErrors();
	if (req.body.id.length > 0 )
	{
		var controlID = req.body.id;
	}
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
			Control.create(newControl, function(err, control){
				if(err) {throw err;}
				console.log("control created:");
				console.log(control);
			});

			req.flash('success_msg',	'You successfully created the ' + 
										newControl._doc.name + ' control' );
			//todo: redirect to what?
			
			res.redirect('/controls/list');
	}
});

router.post('/register/:controlID', lib.authenticatePowerRequest, function(req, res){
	var id = req.params.controlID;
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('description', 'description is required').notEmpty();
	req.checkBody('template', 'a html template is required').notEmpty();
	req.checkBody('code', 'javascript code is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		//todo: user must type all already typed values again, fix that
		res.render('register-control',{errors:errors	});
	} else {
				var values = {
					name		: req.body.name,
					description : req.body.description,
					template	: req.body.template,
					code		: req.body.code
				};
				Control.modify(id, values, function(err, result){
					if(err || result === null || result.ok !== 1) {//(result.ok===1 result.nModified===1)
						//res.send('Error 404 : Not found or unable to update! ');
							req.flash('error',	' unable to update' );
					} else{
							if (result.nModified === 0){
								req.flash('success_msg',	'Control is unchanged!' );
							} else {
								req.flash('success_msg',	'Control updated!' );
							}
					}
					res.redirect('/controls/list');
				});
			
	}
});

router.delete('/:controlID', lib.authenticatePowerRequest, function(req, res){
	var id = req.params.controlID;
	Control.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete control "' + id + '".');
		} else {
			res.status(200).send('Control deleted.');
		}
	});
	
});

router.get('/list', lib.authenticateUrl, function(req, res){
	res.render('list-control');
});

/*listing all devices and return them as a json array*/
router.get('/control-list', lib.authenticateRequest, function(req, res){
	Control.listByOwnerId(req.user._id, function(err, controlList){
		
		var arr = [];
		for(var i = 0; i < controlList.length; i++){
					arr.push({	name:controlList[i].name, 
								description:controlList[i].description,
								id:controlList[i]._id});
		}
		res.json(arr);
	});
});
router.get('/item/:controlID', lib.authenticateRequest, function(req, res){
	var id = req.params.controlID;
	if (id !== undefined){
		Control.getById(id, function(err, control){
				if(err || control === null) {
					res.send('Error 404 : Not found! ');
				} else{
					res.json(control);
				}
			});
		
	}

});
module.exports = router;
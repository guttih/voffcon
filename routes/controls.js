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

			req.flash('success_msg',	'You successfully created the \"' + 
										newControl._doc.name + '\" control' );
			//todo: redirect to what?
			
			res.redirect('/controls/list');
	}
});

router.post('/register/:controlID', lib.authenticateControlOwnerUrl, function(req, res){
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

router.delete('/:controlID', lib.authenticateControlOwnerRequest, function(req, res){
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

/*listing all controls and return them as a json array*/
router.get('/control-list', lib.authenticatePowerRequest, function(req, res){
	Control.listByOwnerId(req.user._id, function(err, controlList){
		
		var arr = [];
		var item;
		var isOwner;
		for(var i = 0; i < controlList.length; i++){
			item = controlList[i];
			isOwner = lib.findObjectID(item._doc.owners, req.user._id);

					arr.push({	name:controlList[i].name, 
								description:controlList[i].description,
								id:controlList[i]._id,
								isOwner:isOwner
							});
		}
		res.json(arr);
	});
});
router.get('/item/:controlID', lib.authenticateRequest, function(req, res){
	// todo: how to authenticate? now a logged in user can use all controls
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

/*render a page wich runs a control, that is if the user is a registered user for that control (has access)*/
router.get('/useraccess/:controlID', lib.authenticateControlOwnerUrl, function(req, res){
	var id = req.params.controlID;
	Control.getById(id, function(err, retControl){
		if(err || retControl === null) {
			req.flash('error',	'Could not find control.' );
			res.redirect('/result');
		} else{
			var control = {
				id:id,
				name:retControl._doc.name
			};
			res.render('useraccess_control', { control:control });
		}
	});
});

router.post('/useraccess/:controlID', lib.authenticateControlOwnerRequest, function(req, res){
	var id = req.params.controlID,
	owners = JSON.parse(req.body.owners),
	users = JSON.parse(req.body.users);
	var values = {
			owners: owners,
			users: users
			};

		Control.modifyUserAccess(id, values, function(err, result){
		var code = 500;
		if(err) {//(result.ok===1 result.nModified===1)
			//res.send('Error 404 : Not found or unable to update! ');
			var msg = "Error modifying users access.";
			if (err.messageToUser !== undefined){
				msg += "<br/><br/>" + err.messageToUser;
				if (err.statusCode !== undefined){
					code = err.statusCode;
				}
			}
				res.status(code).send(msg);
		} else{
				res.status(200).send('Users access changed.');
		}
		
	});

});


module.exports = router;
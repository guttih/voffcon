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
var fs = require('fs');
var lib = require('../utils/glib');
var Control = require('../models/control');
var multer  = require('multer');
var storage = multer.memoryStorage();
var upload = multer({
  storage: storage,
  limits: { fileSize: 100024 }
}).single('control');
//Hér á að búa til module fyrir queries á devices
//Öll köll til servera sem keyra á device ættu að vera hér.
//Þegar query er gert á device þá þarf url á devicesið að vera með 
//í query objectinu
router.get('/', lib.authenticateUrl, function(req, res){
	//res.render('index-control');
	res.redirect('/controls/list');
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
					name        : req.body.name,
					description : req.body.description,
					helpurl     : req.body.helpurl,
					template    : req.body.template,
					code        : req.body.code,
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
					helpurl		: req.body.helpurl,
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

router.post('/register/no-close/:controlID', lib.authenticateControlOwnerUrl, function(req, res){
	var id = req.params.controlID;
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('description', 'description is required').notEmpty();
	req.checkBody('template', 'a html template is required').notEmpty();
	req.checkBody('code', 'javascript code is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		//todo: user must type all already typed values again, fix that
		res.status(422).json(errors);
	} else {
				var values = {
					name		: req.body.name,
					description : req.body.description,
					helpurl		: req.body.helpurl,
					template	: req.body.template,
					code		: req.body.code
				};
				Control.modify(id, values, function(err, result){
					if(err || result === null || result.ok !== 1) {//(result.ok===1 result.nModified===1)
						//res.send('Error 404 : Not found or unable to update! ');
						res.status(400).json({ "error": "unable to update!" });
					} else{
							if (result.nModified === 0){
								res.status(200).json({"success":"Control is unchanged!"});
							} else {
								res.status(200).json({"success":"Control updated!"});
							}
					}
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

					arr.push({	name       :controlList[i].name, 
								description:controlList[i].description,
								helpurl	   : controlList[i].helpurl,
								id         :controlList[i]._id,
								isOwner    :isOwner
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

router.get('/export/:controlID', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.controlID;
	if (id !== undefined){
		Control.getById(id, function(err, control){
				if(err || control === null) {
					req.flash('error',	'Could not find control.' );
					res.redirect('/result');
				} else{
					
					var obj = {
						name        : control._doc.name,
						description : control._doc.description,
						code        : control._doc.code,
						helpurl     : control._doc.helpurl,
						template    : control._doc.template
					};
						var data = JSON.stringify(obj);
						res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':'attachment; filename=' + lib.makeValidFilename(control.name) + '.voffcon.ctrl'});
						res.end( data );
					
					
				}
			});
	}
});
router.get('/upload', lib.authenticateUrl, function(req, res){
	res.render('upload-control');
});

router.post('/upload', lib.authenticateUrl, function (req, res, next) {
// req.file is the `avatar` file
// req.body will hold the text fields, if there were any
upload(req,res,function(err) {
		if(err || req.file === undefined || req.file.fieldname !== "control" ) {
			req.flash('error',	'Error uploading file.' );
			res.redirect('/result');
			return;
		}
		//console.log(req.file.fieldname);
		//console.log(req.file.originalname);
		var str = req.file.buffer.toString();
		var obj;
		try{
			obj = JSON.parse(str);
			
			if (obj.name !== undefined && obj.description !== undefined && obj.code !== undefined && obj.template !== undefined){
				res.render('register-control', {itemUpload:str});
			} else{
				req.flash('error',	'Error uploading file, invalid object.' );
				res.redirect('/result');
			}
		}
		catch(e){
			req.flash('error',	'Error uploading file, error parsing object' );
			res.redirect('/result');
		}		
    });
});

router.get('/help/ctrl/:controlName', function(req, res) {
	var ctrlName = req.params.controlName;
	var ctrlFileName = ctrlName+'.voffcon.ctrl';
	fs.readFile('./public/docs/controls/'+ctrlFileName, "utf-8", function(err, ctrlFile) {
		if (err !== null) {
			req.flash('error',	'Filename "' + ctrlFileName + '" not found!' );
			res.redirect('/result');
			return;
		}

		var ctrlObject;
		try {
			ctrlObject = JSON.parse(ctrlFile);
			
			if (ctrlObject.name === undefined || ctrlObject.description === undefined || ctrlObject.code === undefined || ctrlObject.template === undefined){
				req.flash('error',	'Invalid control!' );
				res.redirect('/result');
				return;
			} 
		}
		catch(e) {
			req.flash('error',	'Error parsing control file.' );
			res.redirect('/result');
			return;
		}
		// We have a valid control



		var filePath = './public/docs/controls/'+ctrlName+'.example.js'
		
		
		fs.readFile(filePath, "utf-8", function(err, file) {
			if (err === null) {
				//We got an example file, let's add it to the control object
				ctrlObject.example=file;
			} 
				
			strObject = JSON.stringify(ctrlObject);
			res.render('control-help', {
				item:strObject,
				name:ctrlObject.name,
				description:ctrlObject.description});
			
		});
		
	});
	
	
});

module.exports = router;

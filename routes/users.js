var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

var http = require('http');
var request = require('request');
var lib = require('../utils/glib');

//var SERVERURL = 'http://192.168.1.151:5100';

var config = lib.getConfig();
//todo: user should maybe store all server urls in a database
var SERVERURL = config.serverUrl;
console.log(config);

// Register
router.get('/register', function(req, res){
	res.render('register-user');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});



// Register User
router.post('/register', function(req, res){
var config = lib.getConfig();
if (config.allowUserRegistration === true) {
	
		var name = req.body.name;
		var email = req.body.email;
		var username = req.body.username;
		var password = req.body.password;
		var password2 = req.body.password2;
		
		// Validation
		req.checkBody('name', 'Name is required').notEmpty();
		req.checkBody('email', 'Email is required').notEmpty();
		req.checkBody('email', 'Email is not valid').isEmail();
		req.checkBody('username', 'Username is required').notEmpty();
		req.checkBody('password', 'Password is required').notEmpty();
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
		var errors = req.validationErrors();

		if(errors){
			var item = {
						name: name,
						email:email,
						username: username
					};
					item = JSON.stringify(item); //todo test this
			res.render('register-user',{ errors:errors, item:item });
		} else {
			var newUser = new User({
				name: name,
				email:email,
				username: username,
				password: password,
				level:0
			});

			User.getUserByUsername(newUser._doc.username, function(err, oldUser){

				if (err === null && oldUser === null){
					
					User.createUser(newUser, function(err, user){
						if (!err){
							req.flash('success_msg', 'You are registered and can now login');
							res.redirect('/users/login');
						} else {
							
							res.render('register-user',{ errors:errors });
						}
					});
				} else {
					//this username is taken
					errors = [];
					errors.push({
									msg: "Username is taken",
									param:"name",
									value: name
					});
					var item = {
						name: name,
						email:email,
						username: username
					};
					item = JSON.stringify(item);

//todo:  passa clientmegin að tékka vort item.id sé til annars un-autorizedl...............


					res.render('register-user',{ errors:errors, item:item });
				}
			});
			
		}
	} else { 
		req.flash('error_msg', 'New users are not allowed at this time.');

			res.redirect('/users/login');
	}
});

//todo: only a authenticateAdminRequest
//todo: user change profile
router.post('/register/:userID', lib.authenticateAdminRequest, function(req, res){
	//user modify
	var id = req.params.userID;
	var password = req.body.password;

	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('level', 'level is required').notEmpty();
	if (password !== undefined && password.length > 0 ){
		req.checkBody('password', 'Password is required').notEmpty();
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	}
	var errors = req.validationErrors();

	if(errors){
		//todo: user must type all already typed values again, fix that
		res.render('register-user',{errors:errors	});
	} else {
		var values = {
				name     : req.body.name,
				email    : req.body.email,
				username : req.body.username,
				level : req.body.level
			};
		
		if (password !== undefined && password.length > 0 ){
			values['password'] = req.body.password;
		}
		User.modify(id, values, function(err, result){
			if(err || result === null || result.ok !== 1) {
					req.flash('error',	' unable to update' );
			} else{
					if (result.nModified === 0){
						req.flash('success_msg',	'User is unchanged!' );
					} else {
						req.flash('success_msg',	'User updated!' );
					}
			}
			res.redirect('/users/register/'+id);
		});
			
	}
});

router.post('/profile/:userID', lib.authenticateRequest, function(req, res){
	var id = req.params.userID;
	var loggedInUserID = res.locals.user._doc._id.toString(); 
	if (id !== loggedInUserID ){
		req.flash('error',	'you can only modify your own settings.' );
		res.redirect('/result');
	} else {
	var password = req.body.password;

	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	if (password !== undefined && password.length > 0 ){
		req.checkBody('password', 'Password is required').notEmpty();
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	}
	var errors = req.validationErrors();

	if(errors){
		//todo: user must type all already typed values again, fix that
		res.render('profile-user',{errors:errors	});
	} else {
		var values = {
				name     : req.body.name,
				email    : req.body.email,
				username : req.body.username,
			};
		
		if (password !== undefined && password.length > 0 ){
			values['password'] = req.body.password;
		}
		User.modify(id, values, function(err, result){
			if(err || result === null || result.ok !== 1) {
					req.flash('error',	' unable to update' );
			} else{
					if (result.nModified === 0){
						req.flash('success_msg',	'User is unchanged!' );
					} else {
						req.flash('success_msg',	'User updated!' );
					}
			}
			res.redirect('/users/profile/'+id);
		});
			
	}
}
});


passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) {throw err;}
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) {throw err;}
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

router.get('/list', lib.authenticateAdminUrl, function(req, res){
	res.render('list-user');
});

/*listing all devices and return them as a json array*/
router.get('/user-list', lib.authenticateRequest, function(req, res){
	User.list(function(err, userList){
		var strDescription, strLevel;
		var arr = [];
		for(var i = 0; i < userList.length; i++){

			
		switch (userList[i].level) {
			case 0:
				strLevel = "normal user";
				break;
			case 1:
				strLevel = "power user";
				break;
			default: 
				strLevel = "administrator";
			}

			strDescription = 'User ' + userList[i].username + 
							' is a <b>' + strLevel + 
							 '</b>.  email:' + userList[i].email;

					arr.push({	name:userList[i].name, 
								description:strDescription,
								id:userList[i]._id,
								username:userList[i].username,
								email: userList[i].email,
								level:userList[i].level
							});
		}
		res.json(arr);
	});
});

router.get('/register/:userID', lib.authenticateAdminUrl, function(req, res){
	var id = req.params.userID;
	if (id !== undefined){
		User.getById(id, function(err, user){
				if(err || user === null) {
					req.flash('error',	'Could not find user.' );
					res.redirect('/result');
				} else{
					var obj = {id : id,
						name: user.name};
					var str = JSON.stringify(obj);
					res.render('register-user', {item:str});
				}
			});
	}
});

router.get('/profile/:userID', lib.authenticateUrl, function(req, res){
	var id = req.params.userID;
	if (id !== undefined){
		User.getById(id, function(err, user){
				if(err || user === null) {
					req.flash('error',	'Could not find user.' );
					res.redirect('/result');
				} else{
					var obj = {id : id,
						name: user.name};
					var str = JSON.stringify(obj);
					res.render('profile-user', {item:str});
				}
			});
	}
});

router.get('/item/:userID', lib.authenticateRequest, function(req, res){
	var id = req.params.userID;
	if (id !== undefined){
		User.getById(id, function(err, user){
				if(err || user === null) {
					res.send('Error 404 : Not found! ');
				} else{
					if (res.locals.user._doc.level > 1){
						//current user is a poweruser so let's tell the client script that
						user._doc.currentUserLevel = res.locals.user._doc.level;
					}
					res.json(user);
				}
			});
	}
});

router.delete('/:userID', lib.authenticateAdminRequest, function(req, res){
	var id = req.params.userID;
	User.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete user "' + id + '".');
		} else {
			res.status(200).send('User deleted.');
		}
	});
	
});


module.exports = router;
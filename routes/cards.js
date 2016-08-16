var express = require('express');
var router = express.Router();
var request = require('request');
var lib = require('../utils/glib');
var Card = require('../models/card');
var config = lib.getConfig();

//Hér á að búa til module fyrir queries á devices
//Öll köll til servera sem keyra á device ættu að vera hér.
//Þegar query er gert á device þá þarf url á devicesið að vera með 
//í query objectinu
router.get('/register', lib.authenticateUrl, function(req, res){
	res.render('register-card');/*this is the views/card.handlebars*/
});

router.get('/', lib.authenticateUrl, function(req, res){
	res.render('index-card');
});

router.post('/register', lib.authenticatePowerRequest, function(req, res){
	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('description', 'description is required').notEmpty();
	req.checkBody('code', 'javascript code is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		//todo: user must type all already typed values again, fix that
		res.render('register-card',{errors:errors	});
	} else {
				var newCard = new Card({
					name			: req.body.name,
					description		: req.body.description,
					code			: req.body.code,
					owners:[],
					users:[]
			});
			newCard.owners.push(req.user._id);
			newCard.users.push(req.user._id);
			console.log("todo: uncomment");
			console.log(newCard._doc);
			//todo: update if card already exists
			Card.createCard(newCard, function(err, card){
				if(err) {throw err;}
				console.log("card created:");
				console.log(card);
			});

			req.flash('success_msg',	'You successfully created the ' + 
										newCard._doc.name + ' card' );
			//todo: redirect to what?
			res.redirect('/result');
	}
});

router.get('/list', lib.authenticateUrl, function(req, res){
	res.render('list-card');
});

/*listing all devices and return them as a json array*/
router.get('/card-list', lib.authenticateRequest, function(req, res){
	Card.listByOwnerId(req.user._id, function(err, cardList){
		
		var arr = [];
		for(var i = 0; i < cardList.length; i++){
					arr.push({	name:cardList[i].name, 
								description:cardList[i].description,
								id:cardList[i]._id});
		}
		res.json(arr);
	});
});



















module.exports = router;
var express = require('express');
var router = express.Router();
var request = require('request');
var lib = require('../utils/glib');
var Card = require('../models/card');
var config = lib.getConfig();


router.get('/', lib.authenticateUrl, function(req, res){
	res.render('index-card');
});

router.get('/register', lib.authenticateUrl, function(req, res){
	res.render('register-card');/*this is the views/card.handlebars*/
});

router.get('/register/:cardID', lib.authenticatePowerUrl, function(req, res){
	var id = req.params.cardID;
	if (id !== undefined){
		Card.getById(id, function(err, card){
				if(err || card === null) {
					req.flash('error',	'Could not find card.' );
					res.redirect('/result');
				} else{
					var obj = {id : id,
						name: card.name};
					var str = JSON.stringify(obj);
					res.render('register-card', {item:str});
				}
			});
		
	}
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
			Card.create(newCard, function(err, card){
				if(err) {throw err;}
				console.log("card created:");
				console.log(card);
			});

			req.flash('success_msg',	'You successfully created the ' + 
										newCard._doc.name + ' card' );
			//todo: redirect to what?
			res.redirect('/cards/list');
	}
});


router.post('/register/:cardID', lib.authenticatePowerRequest, function(req, res){
	var id = req.params.cardID;
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('description', 'description is required').notEmpty();
	req.checkBody('code', 'javascript code is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		//todo: user must type all already typed values again, fix that
		res.render('register-card',{errors:errors	});
	} else {
				var values = {
					name		: req.body.name,
					description : req.body.description,
					code		: req.body.code
				};
				Card.modify(id, values, function(err, result){
					if(err || result === null || result.ok !== 1) {//(result.ok===1 result.nModified===1)
						//res.send('Error 404 : Not found or unable to update! ');
							req.flash('error',	' unable to update' );
					} else{
							if (result.nModified === 0){
								req.flash('success_msg',	'Card is unchanged!' );
							} else {
								req.flash('success_msg',	'Card updated!' );
							}
					}
					res.redirect('/cards/list');
				});
			
	}
});

router.delete('/:cardID', lib.authenticatePowerRequest, function(req, res){
	var id = req.params.cardID;
	Card.delete(id, function(err, result){
		if(err !== null){
			res.status(404).send('unable to delete card "' + id + '".');
		} else {
			res.status(200).send('Card deleted.');
		}
	});
	
});


/*render a page with list of users*/
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



router.get('/item/:cardID', lib.authenticateRequest, function(req, res){
	var id = req.params.cardID;
	if (id !== undefined){
		Card.getById(id, function(err, card){
				if(err || card === null) {
					res.send('Error 404 : Not found! ');
				} else{
					res.json(card);
				}
			});
		
	}

});















module.exports = router;
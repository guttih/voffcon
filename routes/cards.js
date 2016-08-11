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
router.get('/', lib.authenticateUrl, function(req, res){
	res.render('card');/*this is the views/card.handlebars*/
});
module.exports = router;
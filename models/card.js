"use strict";
var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Card Schema
// 	Info on Schema types: http://mongoosejs.com/docs/schematypes.html
var CardSchema = mongoose.Schema({
	name: {
		type: String,
		index:true
	},
	description: {
		type: String
	},
	code: {
		type: String
	},
	/*These users are allowed to modify or delete this card*/
	 owners: [{ObjectId}],
	 /*These users are allowed to use this card*/
	 users: [{ObjectId}]
});

var Card = module.exports = mongoose.model('Card', CardSchema);

/*
userId Must be provided, because there needs to be at least one user who can access
and modify this Card.
*/
module.exports.createCard = function(newCard,  callback){
		newCard.save(callback);
};

module.exports.getCardByCardname = function(Cardname, callback){
	var query = {Cardname: Cardname};
	Card.findOne(query, callback);
};

module.exports.getCardById = function(id, callback){
	Card.findById(id, callback);
};

module.exports.listCardsByUserId = function (userId, callback){
	var query = {users:{$elemMatch: { _id:userId }}};
	Card.find(query, callback);
};

module.exports.listByOwnerId = function (userId, callback){
	var query = {owners:{$elemMatch: { _id:userId }}};
	Card.find(query, callback);
};
/*if you only want users to get cards that they have access to, use this function*/
module.exports.getUserCardsById = function (CardId, userId, callback){
	var query = {	_id: CardId,
					users:{$elemMatch: { _id:userId }}
		};
	Card.find(query, callback);
};

/*if you only want owners to get their cards use this function*/
module.exports.getOwnerCardsById = function (CardId, userId, callback){
	var query = {	_id: CardId,
					owners:{$elemMatch: { _id:userId }}
		};
	Card.find(query, callback);
};
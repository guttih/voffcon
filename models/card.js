"use strict";
var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Card Schema
var CardSchema = mongoose.Schema({
	name: {
		type: String,
		index:true
	},
	description: {
		type: String
	},
	data: Schema.Types.Mixed, /*here I will store anything cards can be of different types*/
	
	 owners: [{ObjectId}],
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

module.exports.listCardsByUserId = function (id, callback){
	var query = {users:{$elemMatch: { _id:id }}};
	Card.find(query, callback);
};

module.exports.getUserCardsById = function (CardId, userId, callback){
	var query = {	_id: CardId,
					users:{$elemMatch: { _id:userId }}
		};
	Card.find(query, callback);
};
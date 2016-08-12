var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');


const fs = require('fs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	level: {
		type: Number
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

function _createUser(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(newUser.password, salt, function(err, hash) {
				newUser.password = hash;
				newUser.save(callback);
			});
		});
}
module.exports.createUser = function(newUser, callback){
	if (newUser._doc.level === 0){
		User.find().count(function (err, count) {
			if (err || count === 0) {
				newUser._doc.level = 1; //the first user will become a powerUser
			}
			_createUser(newUser, callback);
		});	
	}
	else{
		_createUser(newUser, callback);
	}
};

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
};


module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) {throw err;}
    	callback(null, isMatch);
	});
};
module.exports.count = function(id, callback){
	User.count();
};
/*
        Ardos is a system for controlling devices and appliances from anywhere.
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
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');


const fs = require('fs');

// User Schema
// 	Info on Schema types: http://mongoosejs.com/docs/schematypes.html
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
	//level 0 = normal user
	//level 1 = power user
	//level 2 = admin (who can change user values such as change their user level)
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
				newUser._doc.level = 2; //the first user will become admin
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

module.exports.getById = function(id, callback){
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



//get all users
module.exports.list = function (callback){
	var query = {};
	User.find(query, callback);
};

module.exports.modify = function (id, newValues, callback){
	if (newValues.password !== undefined){
		//we need to encrypt the password
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(newValues.password, salt, function(err, hash) {
				newValues.password = hash;
				var val = {$set: newValues};
				User.update({_id: id}, val, callback);
			});
		});
	} else {
		var val = {$set: newValues};
		User.update({_id: id}, val, callback);
	}
};
module.exports.delete = function (id, callback){
	
	User.findByIdAndRemove(id, callback);
};

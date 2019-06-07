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
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var lib = require('./utils/glib');
var config = lib.getConfig();

///////////////////// start mongo /////////////////////////
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/voffcon');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var devices = require('./routes/devices');
var controls = require('./routes/controls');
var cards = require('./routes/cards');
var logs = require('./routes/logs');
var addresses = lib.getAddresses(true);
var subnets = lib.getSubnets(true);
// Init App
var app = express();

mongoose.connection.on('open', function () {
    mongoose.connection.db.listCollections().toArray(function (err, names) {
      if (err) {
        console.log(err);
      } else {
        console.log(names);
      }
    });
});

mongoose.connection.on('connecting', function(){
	console.log("trying to establish a connection to mongo");
});

mongoose.connection.on('connected', function() {
	console.log("connection to mongo established successfully");
});

mongoose.connection.on('error', function(err) {
	console.log('connection to mongo failed ' + err);
});

mongoose.connection.on('disconnected', function() {
	console.log('mongo db connection closed');
	console.log('did you forget to start the mongo database server (mongod.exe)?');
});

var gracefulExit = function() {
	db.close(function(){
		
		console.log('mongoose connection with db server is closing');
		process.exit(0);
	});
};

///////////////////// end mongo /////////////////////////

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/ace-builds', express.static(path.join(__dirname, 'node_modules/ace-builds')));
app.use('/docs',express.static(path.join(__dirname, 'docs') ));


// Express Session
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
	customValidators: {
		isEqual: (value1, value2) => {
		return value1 === value2
		}
	},
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.'), 
		root    = namespace.shift(), 
		formParam = root;

		while(namespace.length) {
		formParam += '[' + namespace.shift() + ']';
		}
		return {
		param : formParam,
		msg   : msg,
		value : value
		};
	}
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {

res.locals.success_msg = req.flash('success_msg');
res.locals.error_msg = req.flash('error_msg');
res.locals.error = req.flash('error');
res.locals.user = req.user || null;
if(res.locals.user && res.locals.user._doc.level > 0){
			res.locals.power_user = req.user;
}
if(res.locals.user && res.locals.user._doc.level > 1){
			res.locals.admin = req.user;
}

res.locals.modal_msg = req.flash('modal_msg');
res.locals.modal_header_msg = req.flash('modal_header_msg');


if (lib.getConfig().allowUserRegistration === true)
{
	res.locals.allowUserRegistration = "checked";
} else {
	res.locals.allowUserRegistration = "unchecked";
}

next();
});


app.use('/', routes);
app.use('/users', users);
app.use('/devices', devices);
app.use('/controls', controls);
app.use('/cards', cards);
app.use('/logs', logs);


app.set('port', config.port);

app.listen(app.get('port'), function(){
	//console.log('Server started on port '+app.get('port'));

	//todo: remvoe this code, and add it to glib and make a solution for linux also
	//I will also need a subnet mask / netmask 
	/*const os = require('os');
	console.log('Server started');
	var gateways;
	var osStr = os.type();
	if (osStr.indexOf("Windows")===0){
		lib.getWindwsDefaultGateways(function(data){
			gateways = data;
			if (gateways !== undefined ){
				console.log("Default gateway: " + gateways[0]);
			}
		});
	}*/
	
	lib.getFirstDefaultGateWay(function(defaultGateway){
		console.log("default gateway : " + defaultGateway);
	});

	//if addresses have the same prefix as the default gateway
	//then they are more likly to be your lan ip address.
	addresses.forEach(function(entry) {
		console.log(" " + entry +":"+ app.get('port'));
	});
	subnets.forEach(function(entry) {
		console.log("subnet: " + entry);
	});

});

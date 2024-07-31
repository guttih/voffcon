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
var express          = require('express');
var path             = require('path');
var cookieParser     = require('cookie-parser');
var bodyParser       = require('body-parser');
var exprHandleBars   = require('express-handlebars');
var expressValidator = require('express-validator');
var flash            = require('connect-flash');
var session          = require('express-session');
var passport         = require('passport');
//var LocalStrategy    = require('passport-local').Strategy;
var lib              = require('./utils/glib');
var config           = lib.getConfig();
var eventQueue       = require('./utils/eventQueue');

var http = require('http');
var https = require('https');
var fs = require('fs');

///////////////////// start mongo /////////////////////////
var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/voffcon')
	.then(function (db) { // <- db as first argument
		console.log('Connected to voffcon');
		//console.log(db)
  	})
  	.catch(function (err) {
		console.log('error connecting to voffcon');
		console.log('did you forget to start the mongo database server (mongod.exe)?');
		process.exit(0);

	});

var db = mongoose.connection;


// Routes
var routes         = require('./routes/index');
var users          = require('./routes/users');
var devices        = require('./routes/devices');
var controls       = require('./routes/controls');
var cards          = require('./routes/cards');
var logs           = require('./routes/logs');
var monitors       = require('./routes/monitors');
var triggerActions = require('./routes/triggeractions');


var addresses = lib.getAddresses(true);
var subnets = lib.getSubnets(true);
// Init App
var app = express();


eventQueue.initialize();

mongoose.connection.on('connecting', function () {
	console.log("trying to establish a connection to mongo");
});

mongoose.connection.on('connected', function () {
	console.log("connection to mongo established successfully");
});

mongoose.connection.on('error', function (err) {
	console.log('connection to mongo failed ' + err);
});

mongoose.connection.on('disconnected', function () {
	console.log('mongo db connection closed');
	console.log('did you forget to start the mongo database server (mongod.exe)?');
});

var gracefulExit = function () {
	db.close(function () {

		console.log('mongoose connection with db server is closing');
		process.exit(0);
	});
};

///////////////////// end mongo /////////////////////////

// View Engine
app.set('views', path.join(__dirname, 'views'));

app.engine('handlebars', exprHandleBars(
	{ defaultLayout: 'layout',
		helpers: {
			userRegistrationLinkClasses: function() {
				return lib.getConfig().allowUserRegistration === undefined || lib.getConfig().allowUserRegistration === true? '':'hidden';
			},
		}
	}
));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/ace-builds', express.static(path.join(__dirname, 'node_modules/ace-builds')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));


// Express Session
app.use(session({ 
	secret           : 'secret',
	saveUninitialized: true,
	resave           : true
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
	errorFormatter: function (param, msg, value) {
		var namespace = param.split('.'),
			root = namespace.shift(),
			formParam = root;

		while (namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
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
	if (res.locals.user && res.locals.user._doc.level > 0) {
		res.locals.power_user = req.user;
	}
	if (res.locals.user && res.locals.user._doc.level > 1) {
		res.locals.admin = req.user;
	}

	res.locals.modal_msg = req.flash('modal_msg');
	res.locals.modal_header_msg = req.flash('modal_header_msg');


	if (lib.getConfig().allowUserRegistration === true) {
		res.locals.allowUserRegistration = "checked";
	} else {
		res.locals.allowUserRegistration = "unchecked";
	}
	
	next();
});

app.use('/'              , routes);
app.use('/users'         , users);
app.use('/devices'       , devices);
app.use('/controls'      , controls);
app.use('/cards'         , cards);
app.use('/logs'          , logs);
app.use('/monitors'      , monitors);
app.use('/triggeractions', triggerActions);


app.set('http_port', config.http_port);
app.set('eventQueue',eventQueue);
// eventQueue can be accessed from a route like this: req.app.locals.eventQueue;

// app.listen(app.get('http_port'), function () {
// 	lib.getFirstDefaultGateWay(function (defaultGateway) {
// 		console.log("default gateway : " + defaultGateway);
// 	});

// 	//if addresses have the same prefix as the default gateway
// 	//then they are more likely to be your lan ip address.
// 	addresses.forEach(function (entry) {
// 		console.log(" " + entry + ":" + app.get('http_port'));
// 	});
// 	subnets.forEach(function (entry) {
// 		console.log("subnet: " + entry);
// 	});

// });

// Create an HTTP server
var httpServer = http.createServer(app);
httpServer.listen(app.get('http_port'), function() {
    lib.getFirstDefaultGateWay(function (defaultGateway) {
        console.log("default gateway : " + defaultGateway);
    });
    
    // If addresses have the same prefix as the default gateway
    // then they are more likely to be your lan ip address.
    addresses.forEach(function (entry) {
        console.log(" " + entry + ":" + app.get('http_port'));
    });
    
    subnets.forEach(function (entry) {
        console.log("subnet: " + entry);
    });

    console.log('HTTP Server started on port ' + app.get('http_port'));
});


app.set('https_port', config.https_port);

// Define your certificate directory
const certDir = '/etc/letsencrypt/live/voff.guttih.com'

// Define your https options
var httpsOptions = {
    key: fs.readFileSync(certDir + '/privkey.pem', 'utf8'),
    cert: fs.readFileSync(certDir + '/cert.pem', 'utf8'),
    ca: fs.readFileSync(certDir + '/chain.pem', 'utf8')
};

// Create an HTTPS server
var httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(app.get('https_port'), function() {
    lib.getFirstDefaultGateWay(function (defaultGateway) {
        console.log("default gateway : " + defaultGateway);
    });

    // If addresses have the same prefix as the default gateway
    // then they are more likely to be your lan ip address.
    addresses.forEach(function (entry) {
        console.log(" " + entry + ":" + app.get('https_port'));
    });
    
    subnets.forEach(function (entry) {
        console.log("subnet: " + entry);
    });

    console.log('HTTPS Server started on port ' + app.get('https_port'));
});
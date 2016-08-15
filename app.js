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

///////////////////// start mongo /////////////////////////
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ardos');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var devices = require('./routes/devices');
var controls = require('./routes/controls');
var cards = require('./routes/cards');
var addresses = lib.getAddresses();

// Init App
var app = express();

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

res.locals.modal_msg = req.flash('modal_msg');
res.locals.modal_header_msg = req.flash('modal_header_msg');

next();
});



app.use('/', routes);
app.use('/users', users);
app.use('/devices', devices);
app.use('/controls', controls);
app.use('/cards', cards);

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	//console.log('Server started on port '+app.get('port'));
	console.log('Server started');
	addresses.forEach(function(entry) {
		console.log(" " + entry +":"+ app.get('port'));
	});
});
var app = require(__dirname + '/../server').app
var express = require(__dirname + '/../server').express
var cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.set('views', __dirname + '/../views')
app.set('view engine', 'mustache');
app.use('/static', express.static('static'));
app.use('/static', express.static('public'));
app.use('/static', express.static('files'));

var jsonParser = bodyParser.json({ type: 'application/json' } );

// init db schema

require('./queue')
var api = require('./api')
app.use('/v1', api);

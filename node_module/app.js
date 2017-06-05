var express = require('express');
var ejsLocals = require('ejs-locals');
var app = express();
var routes = require(__dirname + '/app/routes')(app);
var db = require(__dirname + '/app/db/db');

app.engine('ejs', ejsLocals);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) {
    app.locals.route = req.url;
    next()
});

module.exports = app;
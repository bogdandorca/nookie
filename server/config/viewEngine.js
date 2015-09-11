var express = require('express'),
    jade = require('jade'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

module.exports = function(app){
    app.set('views', './public/');
    app.set('view engine', 'jade');
    app.use(express.static('./public'));
    app.use(bodyParser.json({extended: true}));
    app.use(cookieParser());
};
require('dotenv').config(); 
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('./models/connection');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var listsRouter = require('./routes/lists');
var ratingsRouter = require('./routes/ratings');
var friendsRouter = require('./routes/friends');
var commentsRouter = require('./routes/comments');
var gamesRouter = require('./routes/games');



var app = express();
const cors = require ('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/friends', friendsRouter);
app.use('/lists', listsRouter);
app.use('/ratings', ratingsRouter);
app.use('/comments', commentsRouter);
app.use('/games', gamesRouter);


module.exports = app;

'use strict';

const
  express = require('express');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

var app = express();
var config = require('./server/config/config')[env];

app.listen(config.port, function(){
  console.log('Listening on port ' + config.port);
});

'use strict';

const
  express = require('express'),
  bodyParser = require('body-parser'),
  logger = require('morgan');

var app = express();
app.use(logger('combined'))
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static('public'));

var config = require('./server/config/config');
require('./server/config/routes')(app,config);

app.listen(config.port, function() {
  console.log('Listening on port ' + config.port);
});

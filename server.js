'use strict';

const
  express = require('express');

var app = express();
var config = require('./server/config/config');
require('./server/config/routes')(app,config);

app.listen(config.port, function(){
  console.log('Listening on port ' + config.port);
});

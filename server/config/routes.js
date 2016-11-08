'use strict';

var bot = require('./../controllers/bot')

module.exports = function(app, config) {
  app.get('/facebot', bot.validate);
  app.post('/facebot', bot.process);
}

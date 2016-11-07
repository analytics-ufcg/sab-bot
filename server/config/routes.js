'use strict';

module.exports = function(app, config) {
  app.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === config.fb.validation_token) {
      res.send(req.query['hub.challenge']);
    } else {
      res.send('Error, wrong validation token');
    }
  });
}

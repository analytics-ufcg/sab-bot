'use strict'

var
  config = require('./../config/config'),
  postman = require('./../lib/postman');

exports.validate = function(req, res) {
  if (req.query['hub.verify_token'] === config.fb.validation_token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
};

exports.process = function(req, res) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.message) {
          postman.receivedMessage(messagingEvent);
        } else if (messagingEvent.postback) {
          postman.receivedPostback(messagingEvent);
        }
      });
    });
    res.sendStatus(200);
  }

};

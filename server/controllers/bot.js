'use strict'

var
  config = require('./../config/config'),
  messager = require('./../lib/messager');

exports.validate = function(req, res) {
  console.log('to aqui no validate');
  if (req.query['hub.verify_token'] === config.fb.validation_token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
};

exports.process = function(req, res) {
  var data = req.body;
  console.log('to aqui no process');
  console.log(data);

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.message) {
          messager.receivedMessage(messagingEvent);
        }
      });
    });
  }

};

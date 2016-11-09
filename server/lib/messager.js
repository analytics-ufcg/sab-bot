'use strict'

const request = require('request');

exports.receivedMessage = function(event) {
  var
    senderID = event.sender.id,
    recipientID = event.recipient.id,
    timeOfMessage = event.timestamp,
    message = event.message;

  sendTextMessage(senderID, "Echo");
}

function sendTextMessage(recipientId, messageText) {
  var
    messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: messageText,
        metadata: "DEVELOPER_DEFINED_METADATA"
      }
    };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: "EAAHuk2acSMoBACZAK6AwzmNpNa4LXhHKyKcx3Kvt7CutdlpV45uV06oZBGNsUwDIu58toUJDL6aWIcgRn5b2NBFkvnJtPJ0albYrmnGnFr8hG3xIR20YK0lZB9GkJkswcaVbwCPjPByEi3OEF1bU5nN99QSyhHzYaPDVuZAiBAZDZD" },
    method: 'POST',
    json: messageData
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
}

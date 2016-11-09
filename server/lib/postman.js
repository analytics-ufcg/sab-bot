'use strict'

const request = require('request');

exports.receivedMessage = function(event) {
  var
    senderID = event.sender.id,
    recipientID = event.recipient.id,
    timeOfMessage = event.timestamp,
    message = event.message;

  console.log(message);
  if (message.is_echo) {
    return;
  } else if (message.quick_reply) {
    var quickReplyPayload = message.quick_reply.payload;
    if (!isNaN(quickReplyPayload)) {
      sendTypingOn(senderID);
      processQuickReply(senderID, message.quick_reply);
    }
  }
  processText(senderID, message);
}

exports.receivedPostback = function(event) {
  var
    senderID = event.sender.id,
    recipientID = event.recipient.id,
    timeOfPostback = event.timestamp,
    payload = event.postback.payload;

  if (payload === "GET_STARTED_PAYLOAD"){
    sendStartQuickReply(senderID);
  }
}

function processText(senderID, message) {
  sendTextMessage(senderID, "Echo: " + message.text);
  //getMatch(senderID, message);
}

function processQuickReply(recipientId, quickReply) {
  switch (quickReply.payload) {
    case 'STATUS_PAYLOAD':
      sendTextMessage(recipientId, "Qual o nome do reservatório?");
      break;
    case 'SIGN_UP_PAYLOAD':
      sendTextMessage(recipientId, "Qual reservatório você deseja receber atualizações diárias?")
      break;
    default:
      sendTextMessage(recipientId, "Ajuda tarda mas não falha.");
      break;
  }
  sendTypingOff(recipientId);
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

function sendStartQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Como posso ajudar?",
      quick_replies: [
        {
          "content_type": "text",
          "title": "Volume atual",
          "payload": "STATUS_PAYLOAD"
        },
        {
          "content_type": "text",
          "title": "Receber atualizações",
          "payload":"SIGN_UP_PAYLOAD"
        },
        {
          "content_type": "text",
          "title": "Ajuda",
          "payload": "HELP_PAYLOAD"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendTypingOn(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);
}

function sendTypingOff(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
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

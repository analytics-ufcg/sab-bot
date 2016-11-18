'use strict'

const
  request = require('request'),
  config = require('./../config/config'),
  http = require('https');
var
  keepAliveAgent = new http.Agent({ keepAlive: true });

exports.receivedMessage = function(event) {
  var
    senderID = event.sender.id,
    recipientID = event.recipient.id,
    timeOfMessage = event.timestamp,
    message = event.message;

  if (message.is_echo) {
    return;
  } else if (message.quick_reply) {
    var quickReplyPayload = message.quick_reply.payload;
    if (!isNaN(quickReplyPayload)) {
      sendTypingOn(senderID);
      getInfo(quickReplyPayload, function(reservatorios) {
        sendTypingOff(senderID);
        var messageData = {
          recipient: {
            id: senderID
          },
          message: {
            text: getReservatMessage(reservatorios[0])+" Deseja receber notificações desse reservatório?",
            quick_replies: [{
                "content_type": "text",
                "title": "Sim",
                "payload": 'REGISTER_PAYLOAD;' + quickReplyPayload
              },{
                  "content_type": "text",
                  "title": "Não",
                  "payload": "NOT_REGISTER_PAYLOAD"
                }
            ]
          }
        };
        callSendAPI(messageData);
        return;
      });
      return;
    }
    processQuickReply(senderID, message.quick_reply);
    return;
  }
  processText(senderID, message);
  return;
}

exports.receivedPostback = function(event) {
  var
    senderID = event.sender.id,
    recipientID = event.recipient.id,
    timeOfPostback = event.timestamp,
    payload = event.postback.payload;

  if (payload === "GET_STARTED_PAYLOAD"){
    sendQuickReply(senderID, "Como posso ajudá-lo?");
  }
}

function getReservatMessage(reservat) {
  return reservat.reservat + " está com "+reservat.volume+"hm³, que equivale à "+reservat.volume_percentual+"% da sua capacidade total de "+reservat.capacidade +"hm³";
}

function processText(senderID, message) {
  sendTypingOn(senderID);
  getMatch(message, function success(info) {
    var length = info.length;
    if (!length) {
      sendTypingOff(senderID);
      sendQuickReply(senderID, "Não entendi. Seria isso?");
    } else if (length === 1) {
      getInfo(info[0].id, function(reservatorios) {
        sendTypingOff(senderID);
        sendTextMessage(senderID, getReservatMessage(reservatorios[0]));
      });
    } else {
      var options = [];
      var optionsMessage = "Você quis dizer um desses?\n\n";
      for (var i = 0; i < info.length; i++) {
        optionsMessage += i+1 + '. ' + info[i].reservat + " - " + info[i].uf + "\n";
        options.push({
            "content_type": "text",
            "title": i+1,
            "payload": info[i].id
          })
      }
      var messageData = {
        recipient: {
          id: senderID
        },
        message: {
          text: optionsMessage,
          quick_replies: options
        }
      };
      sendTypingOff(senderID);
      callSendAPI(messageData);
    }
    return;
  }, function error() {
    sendTextMessage(senderID, "Estou indisponível no momento! :/");
    sendTypingOff(senderID);
    return;
  });
}

function getMatch(message, successCallback, errorCallback) {
  request({
    url: config.api + 'reservatorios/similares/' + message.text + '/70',
    json: true
  },function(error, response, body) {
    if (error || response.statusCode !== 200) {
      errorCallback();
      return;
    }
    successCallback(body);
    return;
  });
}

function getInfo(reservatID, callback) {
  request({
      url: config.api + 'reservatorios/' + reservatID + '/info',
      json: true
  }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        return;
      }
      callback(body);
      return;
  });
}

function processQuickReply(recipientId, quickReply) {
  sendTypingOn(recipientId);
  var payload = quickReply.payload.split(";");
  switch (payload[0]) {
    case 'STATUS_PAYLOAD':
      sendTextMessage(recipientId, "Qual o nome do reservatório?");
      break;
    case 'SIGN_UP_PAYLOAD':
      sendTextMessage(recipientId, "Qual reservatório você deseja receber atualizações diárias?")
      break;
    case 'REGISTER_PAYLOAD':
      sendTextMessage(recipientId, "Salvamos o reservatório "+ payload[1] );
      break;
    default:
      // sendTextMessage(recipientId, "Ajuda tarda mas não falha.");
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

function sendQuickReply(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
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

function xxx(messageData) {

  request({
    agent: keepAliveAgent,
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

function callSendAPI(messageData) {
  var post_data = JSON.stringify(messageData);
  var post_req = http.request({
    hostname: 'graph.facebook.com',
    method: 'POST',
    path: '/v2.6/me/messages?access_token=EAAHuk2acSMoBACZAK6AwzmNpNa4LXhHKyKcx3Kvt7CutdlpV45uV06oZBGNsUwDIu58toUJDL6aWIcgRn5b2NBFkvnJtPJ0albYrmnGnFr8hG3xIR20YK0lZB9GkJkswcaVbwCPjPByEi3OEF1bU5nN99QSyhHzYaPDVuZAiBAZDZD',
    agent: keepAliveAgent,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data)
    }
  }, function(res) {
    console.log(res);
  });
  console.log(post_data);
  post_req.write(post_data);
  post_req.end();
}

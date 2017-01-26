'use strict'

const
  request = require('request'),
  config = require('./../config/config'),
  lang = require('./../lang/pt-br'),
  mysql = require('mysql'),
  schedule = require('node-schedule'),
  painter = require('./painter');

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
        sendReservatMessage(senderID, reservatorios[0]);
      }, function() {
        sendTypingOff(senderID);
        sendTextMessage(senderID, lang.RESERVAT_DATA_NOT_FOUND);
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

  switch (payload) {
    case 'GET_STARTED_PAYLOAD':
      sendQuickReply(senderID, lang.INTRO);
      break;
    case 'STOP_NOTIFICATIONS_PAYLOAD':
      unregisterUser(senderID);
      break;
    case 'HELP_PAYLOAD':
      sendTextMessage(senderID, lang.HELP);
      break;
    default:
      sendQuickReply(senderID, lang.INTRO);
      break;
  }
}

function getReservatMessage(reservat) {
  if (reservat.volume) {
    return reservat.reservat + " está com " + reservat.volume+"hm³ (medido em " + reservat.data_informacao + "), que equivale à " + reservat.volume_percentual+"% da sua capacidade total de "+reservat.capacidade +"hm³.";
  }
  return reservat.reservat + " tem capacidade total de " + reservat.capacidade + "hm³. Atualmente não possuímos dados do volume.";
}

function processText(senderID, message) {
  sendTypingOn(senderID);
  getMatch(message, function success(info) {
    var length = info.length;
    if (!length) {
      sendTypingOff(senderID);
      sendQuickReply(senderID, lang.RESERVAT_MATCH_NOT_FOUND);
    } else if (length === 1) {
      getInfo(info[0].id, function(reservatorios) {
        sendTypingOff(senderID);
        sendReservatMessage(senderID, reservatorios[0]);
      }, function() {
        sendTypingOff(senderID);
        sendTextMessage(senderID, lang.RESERVAT_DATA_NOT_FOUND);
      });
    } else if (length <= 10) {
      var options = [];
      var optionsMessage = lang.RESERVAT_MATCH_FOUND;
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
    } else {
      sendTypingOff(senderID);
      sendTextMessage(senderID, lang.RESERVAT_MATCH_TOO_LONG);
    }
    return;
  }, function error() {
    sendTextMessage(senderID, lang.SERVER_ERROR);
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

function getInfo(reservatID, callback, nullCallback) {
  request({
      url: config.api + 'reservatorios/' + reservatID + '/info',
      json: true
  }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        return;
      }
      if (body[0].volume) {
        callback(body);
        return;
      } else {
        nullCallback();
        return;
      }
  });
}

function getAllInfo(callback) {
  request({
      url: config.api + 'reservatorios/info',
      json: true
  }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        return;
      }
      callback(body);
  });
}

function processQuickReply(recipientId, quickReply) {
  sendTypingOn(recipientId);
  var payload = quickReply.payload.split(";");
  switch (payload[0]) {
    case 'STATUS_PAYLOAD':
      sendTextMessage(recipientId, lang.ASK_STATUS);
      break;
    case 'SIGN_UP_PAYLOAD':
      sendTextMessage(recipientId, lang.ASK_SIGN_UP);
      break;
    case 'REGISTER_PAYLOAD':
      registerUser(recipientId, payload[1]);
      break;
    case 'NOT_REGISTER_PAYLOAD':
      sendTextMessage(recipientId, lang.NOTHING_TO_SAY);
      break;
    default:
      sendTextMessage(recipientId, lang.HELP);
      break;
  }
  sendTypingOff(recipientId);
}

function registerUser(recipientId, reservatId) {
  var connection = mysql.createConnection(config.db_config);
  connection.connect();
  connection.query('INSERT INTO tb_user_reservatorio (id_user,id_reservatorio) VALUES('+recipientId+','+reservatId+');', function(err, rows, fields) {
    if (err) {
      if (err.errno == 1062) {
        sendTextMessage(recipientId, lang.RESERVAT_ALREADY_SIGNED);
        return;
      }
      console.log(err);
      return;
    }
    sendTextMessage(recipientId, lang.RESERVAT_SIGN_UP);
  });
  connection.end();
}

function unregisterUser(recipientId) {
  var connection = mysql.createConnection(config.db_config);
  connection.connect();
  connection.query('DELETE FROM tb_user_reservatorio WHERE id_user = '+recipientId+';', function(err, rows, fields) {
    if (err) {
      console.log(err);
      return;
    }
    sendTextMessage(recipientId, lang.RESERVAT_DELETE_NOTIFICATIONS);
  });
  connection.end();
}

function sendReservatMessage(recipientId, reservat) {
  var connection = mysql.createConnection(config.db_config);
  connection.connect();
  connection.query('SELECT COUNT(*) as is_registered FROM tb_user_reservatorio WHERE id_user = '+recipientId+' and id_reservatorio = '+reservat.id+';', function(err, rows, fields) {
    if (err) {
      console.log(err);
      return;
    }
    if (rows[0].is_registered) {
      painter.draw(reservat, function(imageName) {
        sendImageMessage(recipientId, imageName);
      });
      return;
    }
    painter.draw(reservat, function(imageName) {
      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: config.server_url+config.public_path+imageName
            }
          },
          quick_replies: [
            {
              "content_type": "text",
              "title": "Receber atualizações",
              "payload": 'REGISTER_PAYLOAD;' + reservat.id
            },
            {
              "content_type": "text",
              "title": "Obrigado",
              "payload": "NOT_REGISTER_PAYLOAD"
            }
          ]
        }
      };
      callSendAPI(messageData);
      return;
    });
  });
  connection.end();

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

function sendImageMessage(recipientId, imageName) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'image',
        payload: {
          url: config.server_url+config.public_path+imageName
        }
      }
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
    qs: { access_token: config.fb.access_token },
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

function sendReportToAll(reservatId, recipients) {
  getInfo(reservatId, function(reservatorios) {
    painter.draw(reservatorios[0], function(imageName) {
      for (var j = 0; j < recipients.length; j++) {
        sendImageMessage(recipients[j], imageName);
      }
    });
  });
}

schedule.scheduleJob('0 0 10 * * ', function() {
    var connection = mysql.createConnection(config.db_config);
    connection.connect();
    connection.query('select id_reservatorio, group_concat(id_user) as users from tb_user_reservatorio where atualizacao_reservatorio = 1 group by id_reservatorio;', function(err, rows, fields) {
      if (err) {
        console.log(err);
        return;
      }
      for (var i = 0; i < rows.length; i++) {
        var reservatId = rows[i].id_reservatorio;
        var users = rows[i].users.split(",");
        sendReportToAll(reservatId, users);
      }
    });
    connection.end();
});

schedule.scheduleJob('*/2 * * * * ', function() {
  getAllInfo(function(reservatorios) {
    reservatorios.forEach(function(reservat) {
      painter.draw(reservat, function(imageName) {
        console.log(imageName + " salva!");
      });
    });
  });
});

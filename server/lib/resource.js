'use strict'

var
  request = require('request'),
  config = require('./../config/config');

exports.getMatch = function(message, successCallback, errorCallback) {
  var str = message.text.replace(/\?/g, "");
  request({
    url: config.api + 'reservatorios/similares/' + str + '/70',
    json: true
  },function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.error(error);
      errorCallback();
      return;
    }
    successCallback(body);
    return;
  });
}

exports.getInfo = function(reservatID, callback, nullCallback) {
  request({
      url: config.api + 'reservatorios/' + reservatID + '/info',
      json: true
  }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        console.error(error);
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

exports.getAllInfo = function(callback) {
  request({
      url: config.api + 'reservatorios/info',
      json: true
  }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        console.error(error);
        return;
      }
      callback(body);
  });
}

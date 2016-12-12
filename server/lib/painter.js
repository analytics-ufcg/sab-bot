'use strict'

const
  fs = require('fs'),
  canvas = require('canvas'),
  config = require('./../config/config');

exports.draw = function(reservat, callback) {
  fs.readFile(config.imgs_path+'logo.png', function(err, data) {
    if (err) throw err;
    fs.readFile(config.imgs_path+'onda.png', function(err_onda, data_onda) {
      if (err_onda) throw err;
      var
          width = 400,
          height = 450,
          padding = 10,
          x = padding*2,
          y = 130,
          line = 30,
          centerX = width/2,
          centerY = (height/2) + 80,
          circleRadius = 80,
          circleCenterX = centerX + 60,
          circleCenterY = centerY,
          lineWidth = 120,
          percent = 0.1,
          unit = ' hm³',
          max = 1234 + unit,
          volume = 25 + unit;

      var canvas = new canvas(width, height)
      var ctx = canvas.getContext('2d')

      ctx.fillStyle = '#6F7575'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, 100)

      ctx.strokeStyle = '#FFFFFF'
      ctx.strokeRect(padding, padding, 380, 430)

      ctx.strokeStyle = '#6F7575'
      ctx.strokeRect(padding, padding, 380, 430)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '22px Arial'
      ctx.fillText('Açude Epitácio Pessoa', x, y)
      ctx.font = '20px Arial'
      ctx.fillText('Boqueirão', x, (y += line))
      ctx.font = '16px Arial'
      ctx.fillText('Última medição em 01/12/2016', x, (height - line))

      var img = new canvas.Image
      img.src = data
      ctx.drawImage(img, centerX - (img.width/2), padding+5, img.width, img.height)
      ctx.save()

      ctx.font = '16px Arial'
      var width = ctx.measureText(text).width
      ctx.fillText(max, circleCenterX - lineWidth - width, centerY-circleRadius-6)

      ctx.beginPath()
      ctx.strokeStyle = '#305479'
      ctx.lineWidth = 6
      ctx.moveTo(circleCenterX, centerY-circleRadius+3)
      ctx.lineTo(circleCenterX - lineWidth, centerY-circleRadius+3)
      ctx.stroke()
      ctx.closePath()

      ctx.font = '16px Arial'
      var width = ctx.measureText(text).width
      ctx.fillText(volume, circleCenterX - lineWidth - width, centerY + circleRadius - (percent*2*circleRadius)+22)

      ctx.beginPath()
      ctx.moveTo(circleCenterX, centerY + circleRadius - (percent*2*circleRadius)+3)
      ctx.lineTo(circleCenterX - lineWidth, centerY + circleRadius - (percent*2*circleRadius)+3)
      ctx.stroke()
      ctx.closePath()

      ctx.restore()
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(circleCenterX, centerY, circleRadius, 0, Math.PI * 2, true)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
      ctx.clip()

      var onda = new canvas.Image
      onda.src = data_onda
      ctx.drawImage(onda, circleCenterX - circleRadius, centerY + circleRadius - (percent*2*circleRadius) - 8, 2*circleRadius, 2*circleRadius + 20)

      ctx.fillStyle = '#305479'
      ctx.font = '36px Arial'
      var text = (percent*100)+'%'
      var width = ctx.measureText(text).width
      ctx.fillText(text, circleCenterX - (width/2), centerY + 15)

      // ctx.fillStyle = '#FFFFFF'
      // ctx.font = '42px Arial'
      // var text = '100%'
      // var width = ctx.measureText(text).width
      // ctx.fillText(text, centerX - (width/2), centerY + 15)
      // ctx.save()

      ctx.fillStyle = 'rgba(0,0,0,0 )'
      ctx.strokeStyle = '#305479'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(circleCenterX, centerY, circleRadius-3, 0, Math.PI * 2, true)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()

      fs.writeFile(config.public_path+'out.png', canvas.toBuffer(), callback)
    });
  });
}

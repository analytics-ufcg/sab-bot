'use strict'

const
  fs = require('fs'),
  Canvas = require('canvas'),
  numeral = require('numeral'),
  config = require('./../config/config');

numeral.register('locale', 'pt-br', {
  delimiters: {
    thousands: '.',
    decimal: ','
  }
})
numeral.locale('pt-br')

function getCorSituacao(value) {
  var coresSituacao = ['#ff2222','#ff8f61','#d4d73b','#3381ff','#064cbf'];
  switch (true) {
    case value < 10:
      return coresSituacao[0]
    case value >= 10 && value < 25:
      return coresSituacao[1];
    case value >= 25 && value < 50:
      return coresSituacao[2];
    case value >= 50 && value < 75:
      return coresSituacao[3];
    case value >= 75:
      return coresSituacao[4];
    default:
      return '#FFFFFF';
  }
}

exports.draw = function(reservat, callback) {

  fs.readFile(config.imgs_path+'logo.png', function(err, data) {
      if (err) throw err;
      fs.readFile(config.imgs_path+'onda.png', function(err, data_onda) {
        if (err) throw err;
        fs.readFile(config.imgs_path+'ufcg.png', function(err, data_ufcg){
          if (err) throw err;
          fs.readFile(config.imgs_path+'insa.png', function(err, data_insa){
          if (err) throw err;

            var
                width = 448,
                height = 560,
                padding = 10,
                x = padding*2 + 10,
                y = 140,
                line = 27,
                headerHeight = 85,
                centerX = width/2,
                centerY = (height/2) + 80,
                circleRadius = 85,
                circleCenterX = width - circleRadius - 40,
                circleCenterY = height - circleRadius - headerHeight - 45,//y + (2*line) + circleRadius + 10,
                lineWidth = 120,
                percent = reservat.volume_percentual / 100,
                displayPercent = percent,
                unit = ' hm³',
                max = reservat.capacidade,
                volume = reservat.volume;

            var canvas = new Canvas(width, height)
            var ctx = canvas.getContext('2d')

            if(percent >= 1){
              percent = 1;
            } else if (percent < 0.03){
              percent = 0.03;
            }
            
            ctx.fillStyle = '#283c52'
            ctx.fillRect(0, 0, width, height)

            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, width, headerHeight)

            ctx.fillStyle = '#9d9d9c'
            ctx.fillRect(0, height-headerHeight, width, headerHeight)

            ctx.strokeStyle = '#4a72b2'
            ctx.strokeRect(padding, padding, width -20, height - 20)

            ctx.fillStyle = '#283c52'
            ctx.font = '16px Oswald'
            ctx.fillText('insa.gov.br/olhonagua', centerX + 45, height - (headerHeight /2) + 1)

            var split = reservat.reservat.split("(");

            var reservatName = "";
            var reservatNickname = "";
            if (split.length > 1) {
              reservatName = split[0];
              reservatNickname = split[1].substring(0, split[1].length-1);
            } else {
              reservatName = split[0];
            }

            ctx.fillStyle = '#FFFFFF'
            ctx.font = '22px Oswald'
            ctx.fillText(reservatName, x, y)
            ctx.font = '20px Oswald'
            ctx.fillText(reservatNickname, x, y + line)
            ctx.font = '16px Oswald'
            ctx.fillText('Última medição: '+reservat.data_informacao, x, y + 2*line)

            var img = new Canvas.Image
            img.src = data
            ctx.drawImage(img, centerX - (img.width/2), padding+5, img.width *0.85, img.height * 0.85)
            ctx.save()

            img.src = data_insa
            ctx.drawImage(img, x,  height - (headerHeight /2) - 20, img.width *0.05, img.height * 0.05)
            ctx.save()

            img.src = data_ufcg
            ctx.drawImage(img, centerX - 60,  height - (headerHeight /2) - 30, img.width * 0.58, img.height * 0.58)
            ctx.save()

            var corSituacao = getCorSituacao(100*percent);

            ctx.beginPath()
            ctx.strokeStyle = corSituacao
            ctx.lineWidth = 6
            ctx.moveTo(circleCenterX, circleCenterY-circleRadius+3)
            ctx.lineTo(circleCenterX - lineWidth, circleCenterY-circleRadius+3)
            ctx.stroke()
            ctx.closePath()

            ctx.fillStyle = '#9d9d9c'
            ctx.font = '16px Oswald'
            var width = ctx.measureText(text).width
            ctx.fillText('capacidade', circleCenterX - lineWidth - width - 82, circleCenterY-circleRadius-22)
            ctx.fillText('máxima:', circleCenterX - lineWidth - width - 65, circleCenterY-circleRadius-4)

            ctx.fillText('volume', circleCenterX - lineWidth - width - 62, circleCenterY + circleRadius - (percent*2*circleRadius)+20)
            ctx.fillText('atual:', circleCenterX - lineWidth - width - 50, circleCenterY + circleRadius - (percent*2*circleRadius)+38)

            ctx.fillStyle = '#69aff4'
            ctx.font = '16px Oswald'
            var width = ctx.measureText(text).width
            ctx.fillText(numeral(+max).format('0,0.0')+unit, circleCenterX - lineWidth - width, circleCenterY-circleRadius-4)


            var width = ctx.measureText(text).width
            ctx.fillText(numeral(+volume).format('0,0.0')+unit, circleCenterX - lineWidth - width, circleCenterY + circleRadius - (percent*2*circleRadius)+20)

            ctx.beginPath()
            ctx.moveTo(circleCenterX, circleCenterY + circleRadius - (percent*2*circleRadius)+3)
            ctx.lineTo(circleCenterX - lineWidth, circleCenterY + circleRadius - (percent*2*circleRadius)+3)
            ctx.stroke()
            ctx.closePath()

            ctx.restore()
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2, true)
            ctx.fill()
            ctx.stroke()
            ctx.closePath()
            ctx.clip()

            var onda = new Canvas.Image
            onda.src = data_onda
            ctx.drawImage(onda, circleCenterX - circleRadius, circleCenterY + circleRadius - (percent*2*circleRadius) - 8, 2*circleRadius, 2*circleRadius + 20)

            ctx.fillStyle = corSituacao
            ctx.font = '32px Oswald'
            var text = numeral(displayPercent*100).format('0,0.0')+'%'
            var width = ctx.measureText(text).width
            ctx.fillText(text, circleCenterX - (width/2), circleCenterY + 15)

            ctx.fillStyle = 'rgba(0,0,0,0 )'
            ctx.strokeStyle = corSituacao
            ctx.lineWidth = 6
            ctx.beginPath()
            ctx.arc(circleCenterX, circleCenterY, circleRadius-3, 0, Math.PI * 2, true)
            ctx.fill()
            ctx.stroke()
            ctx.closePath()

            var imageName = reservat.id+".png"

            fs.writeFile(config.public_path+imageName, canvas.toBuffer(), callback(imageName))
          });
        });
      });
  });

}

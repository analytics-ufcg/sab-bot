var http = require('http'), fs = require('fs'),
Canvas = require('canvas');

http.createServer(function (req, res) {
    fs.readFile('logo.png', function(err, data) {
        if (err) throw err;
        fs.readFile('onda.png', function(err_onda,data_onda) {
          if(err_onda) throw err;
          var
              width = 400,
              height = 450,
              padding = 10,
              x = padding*2,
              y = 130,
              line = 30,
              centerX = width/2,
              centerY = (height/2) + (y/2),
              circleRadius = 80;

          var canvas = new Canvas(width, height)
          var ctx = canvas.getContext('2d')

          ctx.fillStyle = '#6F7575'
          ctx.fillRect(0, 0, width, height)
          ctx.save()

          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, width, 100)
          ctx.save()

          ctx.strokeStyle = '#FFFFFF'
          ctx.strokeRect(padding, padding, 380, 430)
          ctx.save()

          ctx.strokeStyle = '#6F7575'
          ctx.strokeRect(padding, padding, 380, 430)
          ctx.save()

          ctx.fillStyle = '#FFFFFF'
          ctx.font = '22px Open Sans'
          ctx.fillText('Açude Epitácio Pessoa', x, y)
          ctx.font = '20px Open Sans'
          ctx.fillText('Boqueirão', x, (y += line))
          ctx.font = '18px Open Sans'
          ctx.fillText('Última medição: 01/12/2016', x, (y += line))
          ctx.save()

          var img = new Canvas.Image; // Create a new Image
          img.src = data;
          ctx.drawImage(img, centerX - (img.width/2), padding+5, img.width, img.height);

          ctx.fillStyle = "rgba(0, 0, 200, 0)";;
          ctx.strokeStyle = '#FF0000'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2, true)
          ctx.fill()
          ctx.stroke()
          ctx.closePath()
          ctx.save()
          ctx.clip()

          var onda = new Canvas.Image;
          var percent = 0.35;
          onda.src = data_onda;
          ctx.drawImage(onda, centerX - circleRadius, centerY + circleRadius - (percent*2*circleRadius) - 8,2*circleRadius, 2*circleRadius + 10);



          ctx.fillStyle = '#6F7575'
          ctx.font = '42px Open Sans'
          var text = '100%'
          var width = ctx.measureText(text).width;
          ctx.fillText(text, centerX - (width/2), centerY + 15)
          ctx.save()



          res.write('<html><body>');
          res.write('<img src="' + canvas.toDataURL() + '" />');
          res.write('</body></html>');
          res.end();
        });
    });

}).listen(8124, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8124/');
var Canvas = require('canvas')

'use strict';

const
  resource = require("./server/lib/resource"),
  painter = require('./server/lib/painter');

console.log("Iniciando criação de imagens...");
resource.getAllInfo(function(reservatorios) {
  reservatorios.forEach(function(reservat) {
    painter.draw(reservat, function(imageName) { });
    painter.drawShareable(reservat, function(imageName) {});
  });
  console.log("Criação de imagens concluída.");
});

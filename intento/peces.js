class Pez {
  constructor(juego, x, y, velocidadMax, radioVision) {
      this.juego = juego;
      this.x = x;
      this.y = y;
      this.vel = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
      this.aceleracion = { x: 0, y: 0 };
      this.velocidadMax = velocidadMax;
      this.radioVision = radioVision;
      this.size = 7;

      this.sprite = new PIXI.Graphics();
      this.sprite.beginFill(0x00ffcc);
      this.sprite.drawCircle(0, 0, this.size);
      this.sprite.endFill();
      this.juego.app.stage.addChild(this.sprite);
      
      this.tiempoAlejamiento = Math.random() * 200 + 100; // Tiempo en frames para alejarse
      this.tiempoRestante = this.tiempoAlejamiento; // Inicializar contador de alejamiento
  }

  aplicarFuerza(fuerza) {
      this.aceleracion.x += fuerza.x;
      this.aceleracion.y += fuerza.y;
  }

  cohesion(peces) {
      let centroMasa = { x: 0, y: 0 };
      let count = 0;
      for (let otroPez of peces) {
          if (otroPez !== this && this.distancia(otroPez) < this.radioVision) {
              centroMasa.x += otroPez.x;
              centroMasa.y += otroPez.y;
              count++;
          }
      }
      if (count > 0) {
          centroMasa.x /= count;
          centroMasa.y /= count;
          let direccion = { x: centroMasa.x - this.x, y: centroMasa.y - this.y };
          return this.normalize(direccion);
      }
      return { x: 0, y: 0 };
  }

  separacion(peces) {
      let repulsion = { x: 0, y: 0 };
      let count = 0;
      for (let otroPez of peces) {
          let distancia = this.distancia(otroPez);
          if (otroPez !== this && distancia < this.size * 2) {
              repulsion.x += this.x - otroPez.x;
              repulsion.y += this.y - otroPez.y;
              count++;
          }
      }
      if (count > 0) {
          repulsion.x /= count;
          repulsion.y /= count;
      }
      return this.normalize(repulsion);
  }

  alineacion(peces) {
      let direccionPromedio = { x: 0, y: 0 };
      let count = 0;
      for (let otroPez of peces) {
          if (otroPez !== this && this.distancia(otroPez) < this.radioVision) {
              direccionPromedio.x += otroPez.vel.x;
              direccionPromedio.y += otroPez.vel.y;
              count++;
          }
      }
      if (count > 0) {
          direccionPromedio.x /= count;
          direccionPromedio.y /= count;
          return this.normalize(direccionPromedio);
      }
      return { x: 0, y: 0 };
  }

  alejarseTemporalmente() {
      if (this.tiempoRestante <= 0) {
          this.tiempoRestante = this.tiempoAlejamiento; // Reiniciar el contador de alejamiento
          return { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; // Movimiento aleatorio
      }
      this.tiempoRestante--;
      return { x: 0, y: 0 };
  }

  perseguirComida(puntos) {
      for (let i = 0; i < puntos.length; i++) {
          let punto = puntos[i];
          let distanciaComida = Math.hypot(this.x - punto.cuerpo.position.x, this.y - punto.cuerpo.position.y);
          if (distanciaComida < this.radioVision) {
              let direccionComida = { x: punto.cuerpo.position.x - this.x, y: punto.cuerpo.position.y - this.y };

              if (distanciaComida < this.size + punto.size) {
                  this.juego.app.stage.removeChild(punto.grafico);
                  puntos.splice(i, 1);
              }
              return this.normalize(direccionComida);
          }
      }
      return { x: 0, y: 0 };
  }

  update(puntos, peces) {
      let cohesion = this.cohesion(peces);
      let separacion = this.separacion(peces);
      let alineacion = this.alineacion(peces);
      let persecucionComida = this.perseguirComida(puntos);
      let alejarse = this.alejarseTemporalmente();

      cohesion.x *= 0.05; cohesion.y *= 0.05;
      separacion.x *= 0.3; separacion.y *= 0.3;
      alineacion.x *= 0.1; alineacion.y *= 0.1;
      alejarse.x *= 0.4; alejarse.y *= 0.4;

      this.aplicarFuerza(cohesion);
      this.aplicarFuerza(separacion);
      this.aplicarFuerza(alineacion);
      this.aplicarFuerza(alejarse);

      persecucionComida.x *= 0.5;
      persecucionComida.y *= 0.5;
      this.aplicarFuerza(persecucionComida);

      this.vel.x += this.aceleracion.x;
      this.vel.y += this.aceleracion.y;

      let velocidad = this.normalize(this.vel);
      this.vel.x = velocidad.x * this.velocidadMax;
      this.vel.y = velocidad.y * this.velocidadMax;

      this.x += this.vel.x;
      this.y += this.vel.y;

      this.aceleracion = { x: 0, y: 0 };

      this.sprite.x = this.x;
      this.sprite.y = this.y;
  }

  distancia(otroPez) {
      return Math.hypot(this.x - otroPez.x, this.y - otroPez.y);
  }

  normalize(vector) {
      let magnitude = Math.hypot(vector.x, vector.y);
      if (magnitude > 0) {
          return { x: vector.x / magnitude, y: vector.y / magnitude };
      }
      return { x: 0, y: 0 };
  }
}

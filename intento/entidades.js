class Entidad {
    constructor(juego, x, y, velocidadMax) {
      this.id = generarID();
      this.grid = juego.grid;
      this.app = juego.app;
      this.juego = juego;
      this.container = new PIXI.Container();
      this.juego.app.stage.addChild(this.container);
      this.container.x = x;
      this.container.y = y;
  
      this.velocidad = new PIXI.Point(0, 0);
      this.velocidadMax = velocidadMax;
      this.velocidadMaxCuadrada = velocidadMax * velocidadMax;
  
      // this.container.anchor.set(0.5,1); // Pivote en el centro
  
      this.spritesAnimados = {};
      this.miCeldaActual = null;
    }
  
    cambiarSprite(cual, numero, loop = true) {
      this.spriteActual = cual;
      let sprite = this.spritesAnimados[cual];
      if (!sprite) return null;
      if (numero != undefined) {
        sprite.gotoAndPlay(numero);
      }
      sprite.loop = loop;
      this.container.removeChildren();
      this.container.addChild(sprite);
  
      return sprite;
    }
  
    cargarVariosSpritesAnimados(inObj, w, h, velocidad, cb) {
      let ret = {};
      let keys = Object.keys(inObj);
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        this.cargarSpriteAnimado(inObj[key], w, h, velocidad, (spriteAnimado) => {
          ret[key] = spriteAnimado;
          if (Object.keys(ret).length == keys.length) {
            //TERMINO
            this.spritesAnimados = { ...this.spritesAnimados, ...ret };
            if (cb instanceof Function) cb(this.spritesAnimados);
          }
        });
      }
    }
    cargarSpriteAnimado(url, frameWidth, frameHeight, vel, cb) {
      let texture = PIXI.Texture.from(url);
      texture.baseTexture.on("loaded", () => {
        let width = texture.baseTexture.width;
        let height = texture.baseTexture.height;
        let cantFramesX = width / frameWidth;
        let cantFramesY = height / frameHeight;
  
        const frames = [];
  
        for (let i = 0; i < cantFramesX; i++) {
          for (let j = 0; j < cantFramesY; j++) {
            const rectangle = new PIXI.Rectangle(
              i * frameWidth,
              j * frameHeight,
              frameWidth,
              frameHeight
            );
            const frame = new PIXI.Texture(texture.baseTexture, rectangle);
            // frame.anchor.set(0.5,1)
            
            frames.push(frame);
          }
        } //for
  
        const animatedSprite = new PIXI.AnimatedSprite(frames);
  
        // Configurar la animación
        animatedSprite.animationSpeed = vel;
        animatedSprite.loop = true; // Para que la animación se repita
  
        animatedSprite.anchor.set(0.5, 1);
  
        // Iniciar la animación
        animatedSprite.play();
  
        if (cb) cb(animatedSprite);
      });
    }
    obtenerVecinos(tipoObjeto, margen) {
      let vecinos = [];
      const xIndex = Math.floor(this.container.x / this.grid.cellSize);
      const yIndex = Math.floor(this.container.y / this.grid.cellSize);

      // Verificar la posición actual del tiburón y las celdas adyacentes
      //console.log(`Posición del tiburón: (${this.container.x}, ${this.container.y})`);
      //console.log(`Índice de celda: [${xIndex}, ${yIndex}]`);

      // Iterar sobre las celdas vecinas
      for (let i = -margen; i <= margen; i++) {
          for (let j = -margen; j <= margen; j++) {
              const celda = this.grid.getCell(
                  (xIndex + i) * this.grid.cellSize,
                  (yIndex + j) * this.grid.cellSize
              );

              // Mostrar qué celdas están siendo verificadas
              //console.log(`Verificando celda: [${xIndex + i}, ${yIndex + j}]`);

              if (celda && Array.isArray(celda.objetos)) {
                  // Filtrar solo objetos del tipo adecuado (Pez)
                  vecinos = [
                      ...vecinos,
                      ...celda.objetos.filter((obj) => obj instanceof tipoObjeto && obj !== this),
                  ];
              }
          }
      }

      //console.log(`Vecinos encontrados:`, vecinos);
      return vecinos;
    }
    encontrarVecinoMasCercano(vecinos) {
      if (!vecinos || vecinos.length === 0) {
          return null; // No hay vecinos
      }
  
      let distanciaMinima = Infinity;
      let vecinoMasCercano = null;
  
      vecinos.forEach(vecino => {
          const dx = vecino.container.x - this.container.x;
          const dy = vecino.container.y - this.container.y;
          const distancia = Math.sqrt(dx * dx + dy * dy);
  
          if (distancia < distanciaMinima) {
              distanciaMinima = distancia;
              vecinoMasCercano = vecino;
          }
      });
  
      return vecinoMasCercano;
    }
    obtenerPosicionDeVecino(vecino) {
      if (!vecino || !vecino.container) {
          return { x: 0, y: 0 }; // Valores por defecto
      }
  
      return {
          x: vecino.container.x,
          y: vecino.container.y
      };
  } 
    update() {
      //this.normalizarVelocidad();
  
      this.container.x += this.velocidad.x;
      this.container.y += this.velocidad.y;
      this.actualizarPosicionEnGrid();
      //console.log(`Nueva posición del tiburón: (${this.container.x}, ${this.container.y})`);
      this.actualizarZIndex();
      //this.actualizarLado();

      // Actualizar el contenedor
      this.container.x = this.x;
      this.container.y = this.y;
      
    }
    actualizarPosicionEnGrid() {
      // Eliminar el pez de su celda anterior
      if (this.miCeldaActual) {
          this.miCeldaActual.removeObjeto(this);  // Método para eliminarlo de la celda anterior
      }
  
      // Asignar la nueva celda basada en la nueva posición
      this.miCeldaActual = this.grid.obtenerCeldaPorPosicion(this.container.x, this.container.y);
  
      // Agregar el pez a la nueva celda
      if (this.miCeldaActual) {
          this.miCeldaActual.agregarObjeto(this);  // Método para agregarlo a la nueva celda
      }
  }
  
    aplicarFuerza(fuerza) {
      if (!fuerza) return;
      this.velocidad.x += fuerza.x;
      this.velocidad.y += fuerza.y;
  
      // Limitar la velocidad máxima
      const velocidadCuadrada =
        this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y;
      if (velocidadCuadrada > this.velocidadMaxCuadrada) {
        const magnitud = Math.sqrt(velocidadCuadrada);
        this.velocidad.x = (this.velocidad.x / magnitud) * this.velocidadMax;
        this.velocidad.y = (this.velocidad.y / magnitud) * this.velocidadMax;
      }
    }
    actualizarLado() {
      if (this.velocidad.x > 0) {
        this.container.scale.x = 1;
      } else if (this.velocidad.x < 0) {
        this.container.scale.x = -1;
      } else if (this.velocidad.y == 0 && this instanceof Zombie) {
        if (this.juego.player.container.x > this.container.x) {
          this.container.scale.x = 1;
        } else {
          this.container.scale.x = -1;
        }
      }
    }
    actualizarZIndex() {
      this.container.zIndex = this.container.y;
    }
  
    actualizarRotacion() {
      if (this.velocidad.x !== 0 || this.velocidad.y !== 0) {
        const angulo = Math.atan2(this.velocidad.y, this.velocidad.x);
        this.container.rotation = angulo;
      }
    }
    
}
  
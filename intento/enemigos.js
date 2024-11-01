class Enemigo {
    constructor(juego, x, y, velocidadMax) {
        this.juego = juego;
        this.x = x;
        this.y = y;
        this.vel = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.velocidadMax = velocidadMax || 2;
        this.radioVisionPursuit = 10;
        this.radioVisionKill = 5;
        this.size = 15;

        // Inicialización del sprite, se define en las clases derivadas
        this.sprite = null;
        this.tiempoPersecucion = 1;
        
    }

    update(peces) {
        let pezCercano = this.detectarPeces(peces);

        if (pezCercano) {
            this.tiempoPersecucion = 1; // Reiniciar tiempo de persecución
            this.perseguirPez(pezCercano, peces);
        } else {
            this.movimientoAleatorio();
        }

        // Actualizar posición del sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }

    detectarPeces(peces) {
        let pezCercano = null;
        let distanciaMinima = this.radioVisionPursuit;

        // Buscar el pez más cercano dentro del radio de visión
        for (let pez of peces) {
            const distancia = Math.hypot(pez.x - this.x, pez.y - this.y);
            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                pezCercano = pez;
            }
        }

        return pezCercano;
    }

    perseguirPez(pezCercano, peces) {
        let direccionPez = { x: pezCercano.x - this.x, y: pezCercano.y - this.y };
        let velocidad = this.normalize(direccionPez);
        this.x += velocidad.x * this.velocidadMax;
        this.y += velocidad.y * this.velocidadMax;

        // Cambiar textura del sprite según la dirección de movimiento
        if (velocidad.x > 0) {
            this.sprite.texture = this.sprites.derecha; // Mover a la derecha
        } else if (velocidad.x < 0) {
            this.sprite.texture = this.sprites.izquierda; // Mover a la izquierda
        }

        // Verificar si está en rango para matar al pez
        if (Math.hypot(this.x - pezCercano.x, this.y - pezCercano.y) < this.radioVisionKill) {
            this.matarPez(peces, pezCercano);
        }
    }

    movimientoAleatorio() {
        this.vel.x += (Math.random() - 0.5) * 0.2;
        this.vel.y += (Math.random() - 0.5) * 0.2;

        // Normalizar la velocidad
        const magnitud = Math.hypot(this.vel.x, this.vel.y);
        if (magnitud > this.velocidadMax) {
            this.vel.x = (this.vel.x / magnitud) * this.velocidadMax;
            this.vel.y = (this.vel.y / magnitud) * this.velocidadMax;
        }

        this.x += this.vel.x;
        this.y += this.vel.y;

        // Cambiar textura del sprite según la dirección de movimiento
        if (this.vel.x > 0) {
            this.sprite.texture = this.sprites.derecha; // Mover a la derecha
        } else if (this.vel.x < 0) {
            this.sprite.texture = this.sprites.izquierda; // Mover a la izquierda
        }
    }

    normalize(vector) {
        let magnitude = Math.hypot(vector.x, vector.y);
        return magnitude > 0 ? { x: vector.x / magnitude, y: vector.y / magnitude } : { x: 0, y: 0 };
    }

    // Método para matar al pez
    matarPez(peces, pezCercano) {
        const index = peces.indexOf(pezCercano);
        if (index > -1) {
            peces.splice(index, 1); // Eliminar el pez del array
        }
    }
    
}

// Clase Tiburon1 que hereda de Enemigo
class Tiburon1 extends Enemigo {
    constructor(juego, x, y, velocidadMax) {
        super(juego, x, y, velocidadMax);
        this.cargarSprites();
    }

    cargarSprites() {
        // Cargar texturas para Tiburon1
        this.sprites = {
            derecha: PIXI.Texture.from('sprites/tiburones/tib1Der.png'),
            izquierda: PIXI.Texture.from('sprites/tiburones/tib1Izq.png'),
            muerte: PIXI.Texture.from('sprites/tiburones/muerte.png') // Textura de muerte
        };

        // Crear el sprite inicial usando la textura de la derecha
        this.sprite = new PIXI.Sprite(this.sprites.derecha);
        this.sprite.anchor.set(0.5);
        // Establecer un tamaño específico
        this.sprite.scale.set(0.5);
        this.juego.app.stage.addChild(this.sprite);
    }
}

// Clase Tiburon2 que hereda de Enemigo
class Tiburon2 extends Enemigo {
    constructor(juego, x, y, velocidadMax) {
        super(juego, x, y, velocidadMax);
        this.cargarSprites();
    }

    cargarSprites() {
        // Cargar texturas para Tiburon2
        this.sprites = {
            derecha: PIXI.Texture.from('sprites/tiburones/tib2Der.png'),
            izquierda: PIXI.Texture.from('sprites/tiburones/tib2Izq.png'),
            muerte: PIXI.Texture.from('sprites/tiburones/muerte.png') // Textura de muerte
        };

        // Crear el sprite inicial usando la textura de la derecha
        this.sprite = new PIXI.Sprite(this.sprites.derecha);
        this.sprite.anchor.set(0.5);
        // Establecer un tamaño específico
        this.sprite.scale.set(0.6);
        this.juego.app.stage.addChild(this.sprite);
    }
}

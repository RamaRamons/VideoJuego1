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
        this.sprite = null;
        this.tiempoPersecucion = 1;
        this.ultimoCambioDireccion = Date.now();
        this.separacionMinima = 50;
    }

    update(peces, tiburones) {
        // Eliminar o comentar la función que ajusta la posición dentro del stage
        // this.ajustarPosicionDentroDelStage();
        this.mantenerSeparacion(tiburones);

        let pezCercano = this.detectarPeces(peces);
        if (pezCercano) {
            this.tiempoPersecucion = 1;
            this.perseguirPez(pezCercano, peces);
        } else {
            this.movimientoAleatorio();
        }

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

    mantenerSeparacion(tiburones) {
        for (let tiburon of tiburones) {
            if (tiburon !== this) {
                const distancia = Math.hypot(tiburon.x - this.x, tiburon.y - this.y);
                if (distancia < this.separacionMinima) {
                    const direccion = { x: this.x - tiburon.x, y: this.y - tiburon.y };
                    const normalizada = this.normalize(direccion);
                    this.x += normalizada.x * (this.separacionMinima - distancia) / 10;
                    this.y += normalizada.y * (this.separacionMinima - distancia) / 10;
                }
            }
        }
    }

    perseguirPez(pezCercano, peces) {
        const tiempoActual = Date.now();
        if (tiempoActual - this.ultimoCambioDireccion >= 5000) {
            this.ultimoCambioDireccion = tiempoActual;
            let direccionPez = { x: pezCercano.x - this.x, y: pezCercano.y - this.y };
            let velocidad = this.normalize(direccionPez);
            this.x += velocidad.x * this.velocidadMax;
            this.y += velocidad.y * this.velocidadMax;

            if (velocidad.x > 0) {
                this.sprite.texture = this.sprites.derecha;
            } else if (velocidad.x < 0) {
                this.sprite.texture = this.sprites.izquierda;
            }
        }

        if (Math.hypot(this.x - pezCercano.x, this.y - pezCercano.y) < this.radioVisionKill) {
            this.matarPez(peces, pezCercano);
        }
    }

    movimientoAleatorio() {
        const tiempoActual = Date.now();
        if (tiempoActual - this.ultimoCambioDireccion >= 3000) {
            this.ultimoCambioDireccion = tiempoActual;
            this.vel.x += (Math.random() - 0.5) * 0.2;
            this.vel.y += (Math.random() - 0.5) * 0.2;

            const magnitud = Math.hypot(this.vel.x, this.vel.y);
            if (magnitud > this.velocidadMax) {
                this.vel.x = (this.vel.x / magnitud) * this.velocidadMax;
                this.vel.y = (this.vel.y / magnitud) * this.velocidadMax;
            }

            if (this.vel.x > 0) {
                this.sprite.texture = this.sprites.derecha;
            } else if (this.vel.x < 0) {
                this.sprite.texture = this.sprites.izquierda;
            }
        }

        this.x += this.vel.x;
        this.y += this.vel.y;
    }

    normalize(vector) {
        const magnitude = Math.hypot(vector.x, vector.y);
        return magnitude > 0 ? { x: vector.x / magnitude, y: vector.y / magnitude } : { x: 0, y: 0 };
    }

    matarPez(peces, pezCercano) {
        const index = peces.indexOf(pezCercano);
        if (index > -1) {
            peces.splice(index, 1);
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

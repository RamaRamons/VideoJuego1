class Enemigo {
    constructor(juego, x, y, velocidadMax) {
        this.juego = juego;
        this.grid = juego.grid;
        this.x = x;
        this.y = y;
        this.velocidadMax = velocidadMax || 0.1;
        this.vel = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.radioVisionPursuit = 150;
        this.radioVisionPerder = 160;
        this.size = 15;
        this.separacionMinima = 100;

        this.tiempoCambio = 3000;  // Tiempo en milisegundos para cambiar de dirección (1 segundo)
        this.ultimoCambio = Date.now();  // Momento en que se cambió la dirección por última vez
        this.nuevaDireccion = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; // Nueva dirección aleatoria
        this.suavizado = 0.05;
        
    }

    
    detectarObjetosVecinos() {
        const vecinos = this.grid.obtenerVecinosEnRango(this.x, this.y, this.radioVisionPursuit);  // Usamos el radio de visión
        const pecesCercanos = vecinos.filter(objeto => objeto instanceof Pez);  // Filtramos solo los peces
        return pecesCercanos;
    }


    update(tiburones) {
        this.cambioDeRumbo(); // Llamamos al cambio de rumbo para que el tiburón cambie dirección periódicamente
        this.movimientoAleatorio(); // Aplicamos el movimiento aleatorio con suavizado

        const pecesCercanos = this.detectarObjetosVecinos();
        //console.log(pecesCercanos);  // Puedes ver la lista de los peces cercanos

        // Actualizamos la posición del tiburón con la nueva velocidad
        this.x += this.vel.x;
        this.y += this.vel.y;

        // Limitar la posición del tiburón para que no salga del mapa
        this.limitarPosicion();

        // Actualizar la posición del sprite del tiburón
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }

    perseguirPez(pez) {}

    mantenerSeparacion(tiburones) {}

    normalize(vector) {
        const magnitude = Math.hypot(vector.x, vector.y);  // Calcula la magnitud del vector
        return magnitude > 0 ? { x: vector.x / magnitude, y: vector.y / magnitude } : { x: 0, y: 0 };
    }
    movimientoAleatorio() {
        this.suavizarDireccion(); // Suavizamos el cambio de dirección

        // Normalizamos la velocidad para mantener una velocidad constante
        const direccion = this.normalize(this.vel);
        this.vel.x = direccion.x * this.velocidadMax;
        this.vel.y = direccion.y * this.velocidadMax;
    }
    cambioDeRumbo() {
        const ahora = Date.now();
        if (ahora - this.ultimoCambio > this.tiempoCambio) {
            // Generamos una nueva dirección aleatoria directamente
            this.nuevaDireccion = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; // Nueva dirección
            this.ultimoCambio = ahora; // Actualizamos el tiempo del último cambio
        }
    }
    suavizarDireccion() {
        // Aceptamos una pequeña porción de la nueva dirección
        this.vel.x += (this.nuevaDireccion.x - this.vel.x) * this.suavizado;
        this.vel.y += (this.nuevaDireccion.y - this.vel.y) * this.suavizado;
    }

    limitarPosicion() {
        const minX = 0;
        const minY = 0;
        const maxX = this.juego.grid.columns * this.juego.grid.cellSize - this.size;
        const maxY = this.juego.grid.rows * this.juego.grid.cellSize - this.size;
    
        if (this.x < minX) {
            this.x = minX;
            this.vel.x *= -1; // Cambia de dirección en lugar de detener
        }
        if (this.y < minY) {
            this.y = minY;
            this.vel.y *= -1;
        }
        if (this.x > maxX) {
            this.x = maxX;
            this.vel.x *= -1;
        }
        if (this.y > maxY) {
            this.y = maxY;
            this.vel.y *= -1;
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
class Enemigo extends Entidad {
    constructor(juego, x, y, velocidadMax, animacionJSON, animacionMuerteJSON) {
        super(juego, x, y, velocidadMax);
        this.juego = juego;
        this.grid = juego.grid;
        this.x = x;
        this.y = y;
        this.container.x = this.container.x
        this.container.y = this.container.y
        this.velocidadMax = velocidadMax || 0.1;
        this.vel = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.radioVisionCeldas = 1;
        this.radioVisionPerder = 2;
        this.size = 0.5;
        this.separacionMinima = 100;
        this.sprite = null;
        this.estado = 'vivo'; // Estado inicial
        this.cargarAnimacion(animacionJSON);

        this.tiempoCambio = 3000;  // Tiempo en milisegundos para cambiar de dirección (1 segundo)
        this.ultimoCambio = Date.now();  // Momento en que se cambió la dirección por última vez
        this.nuevaDireccion = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; // Nueva dirección aleatoria
        this.suavizado = 0.05;
        this.muerte = animacionMuerteJSON
    }

    cargarAnimacion(animacionJSON) {
        try {
            const texturaBase = PIXI.Texture.from(animacionJSON.data.meta.image);
            const texturas = [];
    
            for (let key in animacionJSON.data.frames) {
                const frameData = animacionJSON.data.frames[key].frame;
                const textura = new PIXI.Texture(
                    texturaBase.baseTexture,
                    new PIXI.Rectangle(frameData.x, frameData.y, frameData.w, frameData.h)
                );
                texturas.push(textura);
            }
    
            this.sprite = new PIXI.AnimatedSprite(texturas);
            this.sprite.anchor.set(0.5);
            this.sprite.animationSpeed = 0.05;  // Animación más lenta
            this.sprite.scale.set(this.size);  // Cambiar el tamaño del enemigo
            this.sprite.play();
            this.juego.app.stage.addChild(this.sprite);
            
        } catch (error) {
            console.error("Error al procesar la animación:", error);
        }
    }  

    morir() {
        if (this.estado !== 'vivo') return; // Evitar que muera más de una vez

        this.estado = 'muriendo';

        // Cambiar la animación del sprite para mostrar el estado de muerte
        if (this.sprite) {
            this.sprite.stop(); // Detener cualquier animación en curso
            const texturaMuerte = PIXI.Texture.from('sprites/tiburones/eliminated3.png'); // Cambiar por la ruta de la textura
            this.sprite.texture = texturaMuerte;
            this.sprite.scale.set(this.size); // Asegurar el tamaño consistente
        }

        // Tiempo para eliminar al enemigo después de morir
        setTimeout(() => {
            this.estado = 'muerto';
            this.eliminar(); // Eliminar del escenario
        }, 1000); // Ajustar la duración de la animación de muerte
    }

    eliminar() {
        if (this.sprite) {
            this.juego.app.stage.removeChild(this.sprite);
        }
        this.juego.eliminarEnemigo(this); // Asumimos que hay un método para eliminar del juego
    }

    update() {
        if (this.estado !== 'vivo') return; // No actualizar si no está vivo

        super.update(this);
        
        this.cambioDeRumbo(); // Llamamos al cambio de rumbo para que el tiburón cambie dirección periódicamente
        this.movimientoAleatorio(); // Aplicamos el movimiento aleatorio con suavizado

        const pecesCercanos = this.obtenerVecinos(Pez, this.radioVisionCeldas); // Busca solo objetos del tipo `Pez`
        const tiburonesCercanos = this.obtenerVecinos(Enemigo, this.radioVisionCeldas);

        this.perseguirPez(pecesCercanos);

        this.mantenerSeparacion(tiburonesCercanos);
        
        // Actualizamos la posición del tiburón con la nueva velocidad
        this.x += this.vel.x;
        this.y += this.vel.y;

        // Limitar la posición del tiburón para que no salga del mapa
        this.limitarPosicion();

        // Actualizar la posición del sprite del tiburón
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }

    perseguirPez(peces) {
        if (peces.length === 0) return;
    
        // Encontramos el pez más cercano que esté en estado 'vivo' o 'huyendo'
        let pezMasCercano = null;
        let distanciaMinima = Infinity;
    
        for (let pez of peces) {
            // Solo persigue al pez si está vivo o huyendo
            if (pez.estado === 'vivo' || pez.estado === 'huyendo') {
                let distancia = Math.hypot(this.x - pez.x, this.y - pez.y);
                if (distancia < distanciaMinima) {
                    distanciaMinima = distancia;
                    pezMasCercano = pez;
                }
            }
        }
    
        // Si encontramos un pez válido para perseguir, lo seguimos
        if (pezMasCercano) {
            const direccion = {
                x: pezMasCercano.x - this.x,
                y: pezMasCercano.y - this.y
            };
    
            // Normalizamos la dirección para evitar que la velocidad se descontrole
            const direccionNormalizada = this.normalize(direccion);
    
            // Ajustamos la velocidad del tiburón para perseguir al pez
            this.vel.x = direccionNormalizada.x * this.velocidadMax;
            this.vel.y = direccionNormalizada.y * this.velocidadMax;
        }
    }

    mantenerSeparacion(tiburones) {
        let fuerzaSeparacion = { x: 0, y: 0 };
    
        // Recorremos todos los tiburones para calcular la fuerza de separación
        for (const otroTiburon of tiburones) {
            if (otroTiburon !== this) { // Evitar calcular la separación con uno mismo
                const distanciaX = this.x - otroTiburon.x;
                const distanciaY = this.y - otroTiburon.y;
                const distancia = Math.hypot(distanciaX, distanciaY);
    
                // Si están demasiado cerca, aplicar fuerza de separación
                if (distancia < this.separacionMinima) {
                    const factorSeparacion = (this.separacionMinima - distancia) / this.separacionMinima;
    
                    // La fuerza de separación es inversamente proporcional a la distancia
                    fuerzaSeparacion.x += (distanciaX / distancia) * factorSeparacion;
                    fuerzaSeparacion.y += (distanciaY / distancia) * factorSeparacion;
                }
            }
        }
    
        // Aplicar la fuerza de separación al vector de velocidad
        this.vel.x += fuerzaSeparacion.x;
        this.vel.y += fuerzaSeparacion.y;
    
        // Aseguramos que la velocidad no exceda la velocidad máxima
        const velocidadNormalizada = this.normalize(this.vel);
        this.vel.x = velocidadNormalizada.x * this.velocidadMax;
        this.vel.y = velocidadNormalizada.y * this.velocidadMax;
    }

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

        this.actualizarOrientacion(this.vel);
    }

    actualizarOrientacion(velocidad) {
        if (velocidad.x > 0) {
            this.sprite.scale.x = Math.abs(this.sprite.scale.x); // Asegurar orientación derecha
        } else if (velocidad.x < 0) {
            this.sprite.scale.x = -Math.abs(this.sprite.scale.x); // Voltear horizontalmente
        }
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

class Tiburon1 extends Enemigo {
    constructor(juego, x, y, velocidadMax, animacionJSON) {
        super(juego, x, y, velocidadMax, animacionJSON);
    }
}

class Tiburon2 extends Enemigo {
    constructor(juego, x, y, velocidadMax, animacionJSON) {
        super(juego, x, y, velocidadMax, animacionJSON);
    }
}
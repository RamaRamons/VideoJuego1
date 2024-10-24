class Enemigo {
    constructor(juego, x, y, velocidadMax) {
        this.juego = juego;
        this.x = x;
        this.y = y;
        this.vel = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; // Velocidad inicial aleatoria
        this.velocidadMax = velocidadMax || 2;
        this.radioVision = 70; // Radio de visión para perseguir comida
        this.radioVisionPursuit = 50; // Radio de visión para perseguir peces
        this.radioVisionKill = 20; // Radio de visión para matar peces
        this.size = 15; // Tamaño del enemigo

        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(0xff3333);
        this.sprite.drawCircle(0, 0, this.size);
        this.sprite.endFill();
        this.juego.app.stage.addChild(this.sprite);

        this.tiempoPersecucion = 0; // Temporizador para persecución
    }

    // Detectar si hay peces dentro del rango de visión
    detectarPeces(peces) {
        for (let pez of peces) {
            let distanciaPez = Math.hypot(this.x - pez.x, this.y - pez.y);
            if (distanciaPez < this.radioVisionPursuit) {
                return pez; // Retornar el pez más cercano para perseguir
            }
        }
        return null; // No hay peces en rango
    }

    update(puntos, peces) {
        // Lógica de persecución de comida
        let persecucionComida = this.perseguirComida(puntos);
        this.x += persecucionComida.x * this.velocidadMax;
        this.y += persecucionComida.y * this.velocidadMax;

        // Lógica de detección de peces
        let pezCercano = this.detectarPeces(peces);

        if (pezCercano) {
            // Si hay un pez cercano, empieza a perseguirlo por 5 segundos
            this.tiempoPersecucion = 5; // Resetear el tiempo de persecución
            let direccionPez = { x: pezCercano.x - this.x, y: pezCercano.y - this.y };
            let velocidad = this.normalize(direccionPez);
            this.x += velocidad.x * this.velocidadMax;
            this.y += velocidad.y * this.velocidadMax;

            // Lógica de matar peces
            if (Math.hypot(this.x - pezCercano.x, this.y - pezCercano.y) < this.radioVisionKill) {
                this.matarPez(peces, pezCercano);
            }
        } else if (this.tiempoPersecucion > 0) {
            // Reducir el temporizador
            this.tiempoPersecucion -= 0.1; // Ajusta la velocidad del decremento
        }

        // Actualizar la posición del sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }

    matarPez(peces, pezCercano) {
        // Eliminar el pez del arreglo y de la representación gráfica
        peces.splice(peces.indexOf(pezCercano), 1); // Eliminar del arreglo de peces
        this.juego.app.stage.removeChild(pezCercano.sprite); // Eliminar de la escena
        Matter.World.remove(this.juego.world, pezCercano.cuerpo); // Eliminar del mundo de MatterJS
        console.log("¡Pez muerto!"); // Para depuración
    }

    // Método para perseguir comida si está en el rango de visión
    perseguirComida(puntos) {
        for (let punto of puntos) {
            let distanciaComida = Math.hypot(this.x - punto.cuerpo.position.x, this.y - punto.cuerpo.position.y);
            if (distanciaComida < this.radioVision) {
                // Calcular dirección hacia la comida
                let direccionComida = { x: punto.cuerpo.position.x - this.x, y: punto.cuerpo.position.y - this.y };
                return this.normalize(direccionComida);
            }
        }
        return { x: 0, y: 0 };
    }

    // Método para movimiento aleatorio
    movimientoAleatorio() {
        this.vel.x += (Math.random() - 0.5) * 0.2; // Pequeñas variaciones
        this.vel.y += (Math.random() - 0.5) * 0.2; // Pequeñas variaciones

        // Limitar la velocidad
        const magnitud = Math.hypot(this.vel.x, this.vel.y);
        if (magnitud > this.velocidadMax) {
            this.vel.x = (this.vel.x / magnitud) * this.velocidadMax;
            this.vel.y = (this.vel.y / magnitud) * this.velocidadMax;
        }

        // Actualizar posición con el movimiento aleatorio
        this.x += this.vel.x;
        this.y += this.vel.y;
    }

    // Detectar colisiones con la comida
    detectarColisiones(puntos) {
        for (let i = puntos.length - 1; i >= 0; i--) {
            let punto = puntos[i];
            let distanciaColision = Math.hypot(this.x - punto.cuerpo.position.x, this.y - punto.cuerpo.position.y);
            if (distanciaColision < this.size + punto.cuerpo.circleRadius) {
                // Eliminar la comida al colisionar
                this.juego.app.stage.removeChild(punto.grafico); // Eliminar la representación gráfica
                Matter.World.remove(this.juego.world, punto.cuerpo); // Eliminar el cuerpo de MatterJS
                puntos.splice(i, 1); // Eliminar de la lista de puntos
                break; // Salir del bucle después de eliminar
            }
        }
    }

    update(puntos) {
        let persecucionComida = this.perseguirComida(puntos);

        // Si hay comida en el rango, seguirla
        if (persecucionComida.x !== 0 || persecucionComida.y !== 0) {
            // Normalizar la dirección
            const magnitud = Math.hypot(persecucionComida.x, persecucionComida.y);
            if (magnitud > 0) {
                persecucionComida.x /= magnitud; // Normalizar
                persecucionComida.y /= magnitud; // Normalizar
            }

            // Mantener velocidad constante
            this.x += persecucionComida.x * this.velocidadMax;
            this.y += persecucionComida.y * this.velocidadMax;
        } else {
            // Si no hay comida, moverse aleatoriamente
            this.movimientoAleatorio();
        }

        // Detectar colisiones con la comida
        this.detectarColisiones(puntos);

        // Actualizar sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;

        // Permitir que los enemigos salgan de la pantalla
        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;
    }

    normalize(vector) {
        let magnitude = Math.hypot(vector.x, vector.y);
        if (magnitude > 0) {
            return { x: vector.x / magnitude, y: vector.y / magnitude };
        }
        return { x: 0, y: 0 };
    }
}

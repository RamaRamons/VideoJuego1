class Enemigo {
    constructor(juego, x, y, velocidadMax) {
        this.juego = juego;
        this.x = x;
        this.y = y;
        this.vel = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; // Velocidad inicial aleatoria
        this.velocidadMax = velocidadMax || 2;
        this.radioVisionPursuit = 50; // Radio de visión para perseguir peces
        this.radioVisionKill = 20; // Radio de visión para matar peces
        this.size = 15; // Tamaño del enemigo

        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(0xff3333);
        this.sprite.drawCircle(0, 0, this.size);
        this.sprite.endFill();
        this.juego.app.stage.addChild(this.sprite);

        this.tiempoPersecucion = 1; // Temporizador para persecución
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

    update(peces) {
        // Lógica de detección de peces
        let pezCercano = this.detectarPeces(peces);
    
        if (pezCercano) {
            // Si hay un pez cercano, empieza a perseguirlo por 5 segundos
            this.tiempoPersecucion = 1; // Resetear el tiempo de persecución
            let direccionPez = { x: pezCercano.x - this.x, y: pezCercano.y - this.y };
            let velocidad = this.normalize(direccionPez);
            this.x += velocidad.x * this.velocidadMax;
            this.y += velocidad.y * this.velocidadMax;
    
            // Lógica de matar peces
            if (Math.hypot(this.x - pezCercano.x, this.y - pezCercano.y) < this.radioVisionKill) {
                this.matarPez(peces, pezCercano);
            }
        } else {
            // Si no hay pez cercano, moverse aleatoriamente
            this.movimientoAleatorio();
        }
    
        // Actualizar la posición del sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    matarPez(peces, pezCercano) {
        // Asegúrate de que el pezCercano existe y tiene un cuerpo
        if (pezCercano && pezCercano.cuerpo) {
            // Eliminar el pez del arreglo y de la representación gráfica
            peces.splice(peces.indexOf(pezCercano), 1); // Eliminar del arreglo de peces
            this.juego.app.stage.removeChild(pezCercano.sprite); // Eliminar de la escena
            Matter.World.remove(this.juego.world, pezCercano.cuerpo); // Eliminar del mundo de MatterJS
        }
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

    normalize(vector) {
        let magnitude = Math.hypot(vector.x, vector.y);
        if (magnitude > 0) {
            return { x: vector.x / magnitude, y: vector.y / magnitude };
        }
        return { x: 0, y: 0 };
    }
}

class Pez extends Entidad {
    constructor(juego, x, y, velocidadMax, radioVision) {
        super(juego, x, y, velocidadMax);
        this.juego = juego;
        this.x = x;  // Posición inicial
        this.y = y;
        this.vel = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.aceleracion = { x: 0, y: 0 };
        this.velocidadMax = velocidadMax;
        this.radioVision = radioVision;
        this.size = 7;
        this.estado = 'vivo';
        this.direccion = 'derecha';
        this.tiempoEsperaMuerte = 5 // Tiempo a esperar al morir
        this.tiempoMuerto = 0; // Contador para manejar la muerte

        // Cargar las texturas de movimiento y muerte
        this.texturasMovimiento = {
            derecha: PIXI.Texture.from("sprites/pez/pezDer.png"),
            izquierda: PIXI.Texture.from("sprites/pez/pezIzq.png"),
        };

        this.texturasMuerte1 = {
            derecha: PIXI.Texture.from("sprites/pez/pezMuerte1Der.png"),
            izquierda: PIXI.Texture.from("sprites/pez/pezMuerte1Izq.png"),
        };

        this.texturasMuerte2 = {
            derecha: PIXI.Texture.from("sprites/pez/pezMuerte2Der.png"),
            izquierda: PIXI.Texture.from("sprites/pez/pezMuerte2Izq.png"),
        };

        this.container = new PIXI.Container();
        this.sprite = new PIXI.Sprite(this.texturasMovimiento.derecha);
        this.sprite.anchor.set(0.5);
        this.container.addChild(this.sprite);
        this.container.scale.set(0.05); // Ajusta el tamaño si es necesario
        this.juego.app.stage.addChild(this.container);
    }

    cambiarSprite(direccion, estado) {
        if (estado === 'vivo') {
            this.sprite.texture = this.texturasMovimiento[direccion];
        } else if (estado === 'muerto') {
            this.sprite.texture = this.texturasMuerte1[direccion];
        } else if (estado === 'caida') {
            this.sprite.texture = this.texturasMuerte2[direccion];
        }
    }

    aplicarFuerza(fuerza) {
        this.aceleracion.x += fuerza.x;
        this.aceleracion.y += fuerza.y;
    }

    update(peces) {
        if (this.estado === 'vivo') {
            // Forzar la dirección de movimiento cuando esté cerca de los bordes
            if (this.x < 50) {
                this.vel.x = Math.abs(this.vel.x); // Mover a la derecha
            } else if (this.x > this.juego.app.screen.width - 50) {
                this.vel.x = -Math.abs(this.vel.x); // Mover a la izquierda
            }

            if (this.y < 50) {
                this.vel.y = Math.abs(this.vel.y); // Mover hacia abajo
            } else if (this.y > this.juego.app.screen.height - 50) {
                this.vel.y = -Math.abs(this.vel.y); // Mover hacia arriba
            }

            // Fuerzas de cohesión, separación y alineación
            let cohesion = this.cohesion(peces);
            let separacion = this.separacion(peces);
            let alineacion = this.alineacion(peces);

            // Ajustar fuerzas
            cohesion.x *= 0.03; cohesion.y *= 0.03;
            separacion.x *= 0.5; separacion.y *= 0.5; 
            alineacion.x *= 0.1; alineacion.y *= 0.1;

            // Aplicar fuerzas
            this.aplicarFuerza(cohesion);
            this.aplicarFuerza(separacion);
            this.aplicarFuerza(alineacion);

            // Actualizar velocidad y posición
            this.vel.x += this.aceleracion.x;
            this.vel.y += this.aceleracion.y;
            this.vel = this.normalize(this.vel);
            this.vel.x *= this.velocidadMax;
            this.vel.y *= this.velocidadMax;

            this.x += this.vel.x;
            this.y += this.vel.y;
            this.aceleracion = { x: 0, y: 0 };

            // Determinar la dirección para el sprite
            this.direccion = this.vel.x > 0 ? 'derecha' : 'izquierda';
            this.cambiarSprite(this.direccion, this.estado);

            // Actualizar la posición del contenedor
            this.container.x = this.x;
            this.container.y = this.y;
        } else if (this.estado === 'muerto') {
            this.tiempoMuerto += this.juego.app.ticker.deltaMS; // Tiempo que ha pasado
            if (this.tiempoMuerto >= this.tiempoEsperaMuerte) {
                this.estado = 'caida';
                this.cambiarSprite(this.direccion, this.estado);
                this.vel.y = 0.1; // Velocidad de caída
            }
        } else if (this.estado === 'caida') {
            this.vel.y += 0.05; // Aumentar la gravedad
            this.x += this.vel.x;
            this.y += this.vel.y;

            if (this.tiempoMuerto >= 5000) { // Tiempo de caída de 5 segundos
                this.juego.eliminarPez(this); // Eliminar el pez
            }
        }
        super.update()
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
            if (otroPez !== this && distancia < this.size * 4) { 
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

    distancia(otro) {
        return Math.sqrt((this.x - otro.x) ** 2 + (this.y - otro.y) ** 2);
    }

    normalize(vector) {
        let mag = Math.sqrt(vector.x ** 2 + vector.y ** 2);
        if (mag > 0) {
            return { x: vector.x / mag, y: vector.y / mag };
        }
        return { x: 0, y: 0 };
    }
}

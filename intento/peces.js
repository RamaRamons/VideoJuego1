class Pez {
    constructor(juego, x, y, velocidadMax, radioVision) {
        this.juego = juego;
        this.x = this.juego.app.screen.width / 2;  // Posicionar en el centro
        this.y = this.juego.app.screen.height / 2;
        this.vel = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.aceleracion = { x: 0, y: 0 };
        this.velocidadMax = velocidadMax;
        this.radioVision = radioVision;
        this.size = 7;
        this.estado = 'vivo';
        this.direccion = 'derecha';

        // Cargar las texturas de movimiento y muerte
        this.texturasMovimiento = {
            derecha: PIXI.Texture.from("sprites/pez/movimiento/pezDer.png"),
            izquierda: PIXI.Texture.from("sprites/pez/movimiento/pezIzq.png"),
            abajoIzq: PIXI.Texture.from("sprites/pez/movimiento/pezIzqAb.png"),
            arribaIzq: PIXI.Texture.from("sprites/pez/movimiento/pezIzqAr.png"),
            abajoDer: PIXI.Texture.from("sprites/pez/movimiento/pezDerAb.png"),
            arribaDer: PIXI.Texture.from("sprites/pez/movimiento/pezDerAr.png"),
        };

        this.texturasMuerte1 = {
            derecha: PIXI.Texture.from("sprites/pez/muertes/pezMuerte1Der.png"),
            izquierda: PIXI.Texture.from("sprites/pez/muertes/pezMuerte1Izq.png"),
            abajoIzq: PIXI.Texture.from("sprites/pez/muertes/pezMuerte1IzqAb.png"),
            arribaIzq: PIXI.Texture.from("sprites/pez/muertes/pezMuerte1IzqAr.png"),
            abajoDer: PIXI.Texture.from("sprites/pez/muertes/pezMuerte1DerAb.png"),
            arribaDer: PIXI.Texture.from("sprites/pez/muertes/pezMuerte1DerAr.png"),
        };

        this.container = new PIXI.Container();
        this.sprite = new PIXI.Sprite(this.texturasMovimiento.derecha);
        this.sprite.anchor.set(0.5);
        this.container.addChild(this.sprite);
        this.container.scale.set(0.05); // Ajusta el tamaño si es necesario
        this.juego.app.stage.addChild(this.container);

        // Crear el cuerpo en MatterJS
        this.cuerpo = Matter.Bodies.circle(this.x, this.y, this.size, { isStatic: false });
        Matter.World.add(this.juego.world, this.cuerpo);
    }

    cambiarSprite(direccion, estado) {
        if (estado === 'vivo') {
            this.sprite.texture = this.texturasMovimiento[direccion];
        } else if (estado === 'muerto') {
            this.sprite.texture = this.texturasMuerte1[direccion];
        }
    }

    aplicarFuerza(fuerza) {
        this.aceleracion.x += fuerza.x;
        this.aceleracion.y += fuerza.y;
    }

    update(peces) {
        // Fuerzas de cohesión, separación y alineación
        let cohesion = this.cohesion(peces);
        let separacion = this.separacion(peces);
        let alineacion = this.alineacion(peces);

        // Ajustar fuerzas para mayor separación
        cohesion.x *= 0.03; cohesion.y *= 0.03;
        separacion.x *= 0.5; separacion.y *= 0.5; // Incrementa la separación
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

        // Limitar la posición a los bordes de la pantalla
        if (this.x < 0) this.x = this.juego.app.screen.width;
        if (this.x > this.juego.app.screen.width) this.x = 0;
        if (this.y < 0) this.y = this.juego.app.screen.height;
        if (this.y > this.juego.app.screen.height) this.y = 0;

        // Determinar la dirección para el sprite
        if (this.vel.x > 0) {
            this.direccion = this.vel.y > 0 ? 'abajoDer' : 'arribaDer';
        } else {
            this.direccion = this.vel.y > 0 ? 'abajoIzq' : 'arribaIzq';
        }

        this.cambiarSprite(this.direccion, this.estado);

        // Actualizar la posición del contenedor
        this.container.x = this.x;
        this.container.y = this.y;
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
            if (otroPez !== this && distancia < this.size * 4) {  // Aumentar el umbral de distancia
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

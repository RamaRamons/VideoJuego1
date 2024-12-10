class Pez extends Entidad {
    constructor(juego, x, y, velocidadMax, radioVision) {
        super(juego, x, y, velocidadMax);
        this.juego = juego;
        this.x = x;  // Posición inicial
        this.y = y;
        this.vel = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.aceleracion = { x: 0, y: 0 };
        this.radioVisionCeldas = 2;
        this.velocidadMax = velocidadMax;
        this.equipoParaUpdate = Math.floor(Math.random() * 9) + 1;
        this.radioVision = radioVision;
        this.listo = true
        this.vision = 200
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
        } else if (estado === 'huyendo') {
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
        if (this.estado === 'muerto') {
            // Incrementa el tiempo en estado "muerto"
            this.cambiarSprite(this.direccion, this.estado);
            this.tiempoMuerto += this.juego.app.ticker.deltaMS;
    
            if (this.tiempoMuerto >= this.tiempoEsperaMuerte * 1000) { // Cambiar a "caída" tras el tiempo de espera
                this.estado = 'caida';
                this.cambiarSprite(this.direccion, this.estado);
                this.vel.y = 0.1; // Velocidad inicial de caída
                this.tiempoMuerto = 0; // Reiniciar contador para manejar el tiempo en caída
            }
            return;
        }
    
        if (this.estado === 'caida') {
            // Incrementar el tiempo de caída
            this.tiempoMuerto += this.juego.app.ticker.deltaMS;
    
            // Simular caída
            this.vel.y += 0.05; // Efecto de gravedad
            this.x += this.vel.x;
            this.y += this.vel.y;
    
            // Actualizar posición en pantalla
            this.container.x = this.x;
            this.container.y = this.y;
    
            // Eliminar el pez después de 5 segundos en caída
            if (this.tiempoMuerto >= 5000) {
                this.juego.eliminarPez(this); // Llama al método para eliminar el pez
            }
            return;
        }

        // Solo continuar con las lógicas de movimiento y cambio de estado si no está muerto
        //console.log(this.estado);
        this.segunDatosCambiarDeEstado();
        this.mirarEntorno();

        if (!this.listo) return;

        if (this.estado === 'vivo' || this.estado === 'huyendo') {
            // Lógica de movimiento y otras reglas si está vivo o huyendo

            // Reglas de bordes (mantener al pez dentro del área)
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

            // Aquí aplicamos la velocidad extra si el pez está huyendo
            if (this.estado === 'huyendo') {
                const factorDeEscape = 0.3;  // Suavizado de la velocidad para la huida
                // Aceleración suave hacia la dirección opuesta
                this.vel.x = this.vel.x * (1 + factorDeEscape); // Acelera gradualmente
                this.vel.y = this.vel.y * (1 + factorDeEscape); // Acelera gradualmente
            }

            // Limitar la velocidad máxima
            this.vel.x = Math.min(this.vel.x, this.velocidadMax);
            this.vel.y = Math.min(this.vel.y, this.velocidadMax);

            // Actualizar posición
            this.x += this.vel.x;
            this.y += this.vel.y;
            this.aceleracion = { x: 0, y: 0 };

            // Determinar la dirección del sprite
            this.direccion = this.vel.x > 0 ? 'derecha' : 'izquierda';
            this.cambiarSprite(this.direccion, this.estado);

            

            if (this.estado === 'huyendo') {
                const tiburon = this.obtenerVecinos(Enemigo, this.radioVisionCeldas);
            
                if (tiburon.length > 0) {
                    let tiburonMasCercano = this.encontrarTiburonMasCercano(tiburon);
                    if (tiburonMasCercano) {
                        let escape = { 
                            x: this.x - tiburonMasCercano.x, 
                            y: this.y - tiburonMasCercano.y 
                        };
            
                        // Aquí aplicamos un lerp para suavizar el cambio de dirección
                        // Lerp entre la dirección actual y la de escape
                        this.vel.x = this.lerp(this.vel.x, escape.x, 0.1);  // 0.1 es el factor de suavizado, ajustable
                        this.vel.y = this.lerp(this.vel.y, escape.y, 0.1);  // Lo mismo para el eje Y
            
                        // Suavizamos también el cambio de velocidad si es necesario
                        this.vel.x = this.lerp(this.vel.x, escape.x, 0.1); // Gradual
                        this.vel.y = this.lerp(this.vel.y, escape.y, 0.1); // Gradual
            
                        // Asegúrate de que la velocidad no supere la velocidad máxima
                        this.vel = this.normalize(this.vel);
                    }
                }
            }
        }
        super.update(this);
    }
    lerp(a, b, t) {
        return a + (b - a) * t; // Interpolación lineal
    }
    mirarEntorno() {
        this.vecinos = this.obtenerVecinos(Enemigo, this.radioVisionCeldas);
        //console.log(this.vecinos)
        this.estoyViendoAlTiburon= this.evaluarSiEstoyViendoTiburon(this.vecinos);
    }
    segunDatosCambiarDeEstado() {
        // Primero verifica si el tiburón está cerca
        if (this.estoyViendoAlTiburon) {
            this.estado = 'huyendo';
        } else {
            this.estado = 'vivo';
        }
    
        // Verificar si el tiburón está dentro del radio de 10 píxeles
        const tiburon = this.obtenerVecinos(Enemigo, this.radioVisionCeldas);
        if (tiburon.length > 0) {
            let tiburonMasCercano = this.encontrarTiburonMasCercano(tiburon);
            if (tiburonMasCercano) {
                const distancia = this.distancia(tiburonMasCercano);
                if (distancia <= 10) {
                    this.estado = 'muerto'; // El pez muere si está cerca del tiburón
                }
            }
        }
    }
    evaluarSiEstoyViendoTiburon(tiburones) {
        let tiburon = this.encontrarTiburonMasCercano(tiburones);
        let tiburonsin = this.obtenerPosicionDeVecino(tiburon);
        const distanciaCuadrada = distanciaAlCuadrado(
          this.container.x,
          this.container.y,
          tiburonsin.x,
          tiburonsin.y
        );
    
        if (distanciaCuadrada < this.vision ** 2) {
          return true;
        }
        return false;
    }
    encontrarTiburonMasCercano(tiburones) {
        let tiburonMasCercano = null;
        let distanciaMinima = 200;  // Iniciar con un valor alto

        for (let tiburon of tiburones) {
            const distanciaActual = this.distancia(tiburon);  // Usar la función de distancia
            
            if (distanciaActual < distanciaMinima) {
                tiburonMasCercano = tiburon;  // Guardar el tiburón más cercano
                distanciaMinima = distanciaActual;  // Actualizar la distancia mínima
            }
        }

        return tiburonMasCercano;  // Retornar el tiburón más cercano
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

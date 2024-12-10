class Jugador {
    constructor(app) {
        // Crear el contenedor para el sprite del jugador
        this.sprite = new PIXI.Container();
        this.app = app;
        this.sprite.x = 4500
        this.sprite.y = 4500
        

        // Cambiar el centro del sprite para que el buzo se vea bien al girar
        this.sprite.pivot.set(16, 16); // Ajustar según el centro del sprite, si es necesario

        // Cargar las animaciones desde las texturas ya cargadas en el juego
        this.animaciones = {
            "nadando derecha": this.cargarAnimacion("sprites/buzo/animacionderecha/BuzoDerecha.json"),
            "nadando izquierda": this.cargarAnimacion("sprites/buzo/animacionizquierda/BuzoIzquierda.json"),
            "nadando derecha arriba": this.cargarAnimacion("sprites/buzo/animacionarriba/derecha/BuzoDerechaArriba.json"),
            "nadando izquierda arriba": this.cargarAnimacion("sprites/buzo/animacionarriba/izquierda/BuzoIzquierdaArriba.json"),
            "nadando derecha abajo": this.cargarAnimacion("sprites/buzo/animacionabajo/derecha/BuzoDerechaAbajo.json"),
            "nadando izquierda abajo": this.cargarAnimacion("sprites/buzo/animacionabajo/izquierda/BuzoIzquierdaAbajo.json"),
        };

        // Configurar la animación inicial
        this.direccionActual = "nadando derecha";
        this.sprite.scale.set(0.2);  // Escala el jugador al 30% de su tamaño original (era de 0.5)
        this.sprite.addChild(this.animaciones[this.direccionActual]);
        this.animaciones[this.direccionActual].play();
        this.sprite.pivot.set(650 , 650)

        this.cooldownArpon = false; // Estado de cooldown
        this.tiempoCooldown = 1000; // Tiempo de cooldown en milisegundos

        // Configurar la velocidad de movimiento
        this.velocidad = 3; // Cambia este valor para ajustar la velocidad

        // Almacenar la última posición del mouse
        this.ultimaPosicionMouse = { x: 0, y: 0 };
        this.arpones = []

        // Agregar el ticker para el movimiento
        app.ticker.add(() => this.persigueMouse());

        // Evento para lanzar el arpón
        window.addEventListener('click', () => this.lanzarArpon());
    }

    cargarAnimacion(json) {
        const frames = [];
        const recurso = PIXI.Loader.shared.resources[json];
        const animacionData = recurso.spritesheet.animations;
        const animationName = json.split('/').pop().replace('.json', '');
        const framesList = animacionData[animationName];

        framesList.forEach((frame) => {
            if (frame instanceof PIXI.Texture) {
                frames.push(frame);
            } else {
                console.error(`El frame no es una textura válida:`, frame);
            }
        });

        const animacion = new PIXI.AnimatedSprite(frames);
        animacion.animationSpeed = 0.1; // Ajustar velocidad de la animación
        animacion.loop = true;
        return animacion;
    }

    apuntarHaciaMouse(mouseX, mouseY) {
        // Obtener la posición actual del jugador
        const jugadorX = this.sprite.x;
        const jugadorY = this.sprite.y;

        // Calcular la dirección hacia el mouse
        const dx = mouseX - jugadorX;
        const dy = mouseY - jugadorY;

        // Determinar la dirección de la animación
        let nuevaDireccion = this.direccionActual;

        // Calcular si la dirección principal es más horizontal o vertical
        if (Math.abs(dx) > Math.abs(dy)) {
            nuevaDireccion = dx > 0 ? "nadando derecha" : "nadando izquierda";
        } else {
            if (dy > 0) {
                nuevaDireccion = dx > 0 ? "nadando derecha abajo" : "nadando izquierda abajo";
            } else {
                nuevaDireccion = dx > 0 ? "nadando derecha arriba" : "nadando izquierda arriba";
            }
        }

        // Cambiar la animación solo si la dirección ha cambiado
        if (nuevaDireccion !== this.direccionActual) {
            this.sprite.removeChild(this.animaciones[this.direccionActual]);
            this.direccionActual = nuevaDireccion;
            this.sprite.addChild(this.animaciones[this.direccionActual]);
            this.animaciones[this.direccionActual].play();
        }
    }

    persigueMouse() {
        // Obtener las coordenadas del mouse (usando los eventos de PIXI)
        const mouseX = this.app.renderer.plugins.interaction.mouse.global.x + this.app.stage.pivot.x - this.app.stage.x;
        const mouseY = this.app.renderer.plugins.interaction.mouse.global.y + this.app.stage.pivot.y - this.app.stage.y;

        // Calcular la dirección hacia el mouse
        const dx = mouseX - this.sprite.x;
        const dy = mouseY - this.sprite.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        // Si el mouse está cerca del jugador, dejar de moverlo
        if (distancia < 200) return;

        // Calcular el ángulo hacia el mouse
        const angle = Math.atan2(dy, dx);

        // Mover al jugador gradualmente hacia el mouse
        this.sprite.x += Math.cos(angle) * this.velocidad;
        this.sprite.y += Math.sin(angle) * this.velocidad;

        // Actualizar la animación hacia el mouse
        this.apuntarHaciaMouse(mouseX, mouseY);
    }

    lanzarArpon() {

        if (this.cooldownArpon) return;
        // Obtener las coordenadas del mouse en el espacio del juego
          const mouseX = this.app.renderer.plugins.interaction.mouse.global.x + this.app.stage.pivot.x - this.app.stage.x;
          const mouseY = this.app.renderer.plugins.interaction.mouse.global.y + this.app.stage.pivot.y - this.app.stage.y;

          // Crear y disparar el arpón
          const arpon1 = new Arpon(this.app, this.sprite.x, this.sprite.y, mouseX, mouseY);
          this.arpones.push(arpon1)
          

          this.activarCooldown();
    }
    
    activarCooldown() {
        this.cooldownArpon = true;
        setTimeout(() => {
            this.cooldownArpon = false; // Cooldown terminado
        }, this.tiempoCooldown);
    }
}

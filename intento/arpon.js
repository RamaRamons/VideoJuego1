class Arpon {
    constructor(jugador, direccion) {
        // Crear un contenedor para el arpon, que se va a agregar al contenedor del jugador
        this.sprite = new PIXI.Sprite();
        this.jugador = jugador;
        this.velocidad = 5; // Velocidad del arpón
        this.direccion = direccion; // Dirección pasada al disparar
        this.tiempoVida = 100; // Tiempo de vida del arpón antes de desaparecer

        // Definir los sprites para el arpón en las diferentes direcciones
        this.sprites = {
            "izquierda": PIXI.Texture.from("sprites/arpon/izquierda.png"),
            "izquierdaArriba": PIXI.Texture.from("sprites/arpon/arribaIzquierda.png"),
            "izquierdaAbajo": PIXI.Texture.from("sprites/arpon/abajoIzquierda.png"),
            "derecha": PIXI.Texture.from("sprites/arpon/derecha.png"),
            "derechaArriba": PIXI.Texture.from("sprites/arpon/arribaDerecha.png"),
            "derechaAbajo": PIXI.Texture.from("sprites/arpon/abajoDerecha.png"),
        };

        // Asignar el sprite inicial según la dirección del arpón
        this.sprite.texture = this.sprites[this.direccion];

        // Posicionar el arpón en la posición del jugador
        this.sprite.x = this.jugador.sprite.x;
        this.sprite.y = this.jugador.sprite.y;

        // Agregar el arpón al escenario
        this.jugador.sprite.addChild(this.sprite);

        // Empezar el movimiento
        this.mover();
    }

    // Mover el arpón en la dirección de disparo
    mover() {
        const dx = { 
            "derecha": 1,
            "izquierda": -1,
            "derechaArriba": 1,
            "izquierdaArriba": -1,
            "derechaAbajo": 1,
            "izquierdaAbajo": -1
        };

        const dy = {
            "derecha": 0,
            "izquierda": 0,
            "derechaArriba": -1,
            "izquierdaArriba": -1,
            "derechaAbajo": 1,
            "izquierdaAbajo": 1
        };

        const diagonalFactor = 0.7071; // Aproximación para los disparos diagonales

        let velocidadX = dx[this.direccion] * this.velocidad;
        let velocidadY = dy[this.direccion] * this.velocidad;

        // Ajustar la velocidad para disparos diagonales
        if (this.direccion.includes("arriba") || this.direccion.includes("abajo")) {
            velocidadX *= diagonalFactor;
            velocidadY *= diagonalFactor;
        }

        // Actualizar la posición del arpón
        this.sprite.x += velocidadX;
        this.sprite.y += velocidadY;

        // Reducir el tiempo de vida del arpón
        this.tiempoVida--;

        if (this.tiempoVida <= 0) {
            this.desaparecer();
        }
    }

    // Desaparecer el arpón cuando se acaba su tiempo de vida
    desaparecer() {
        this.jugador.sprite.removeChild(this.sprite);
    }
}

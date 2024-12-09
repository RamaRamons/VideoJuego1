class Arpon {
    constructor(app, startX, startY, targetX, targetY) {
        this.app = app;
        this.velocidad = 10; // Velocidad del arpón
        this.tiempoVida = 300; // Tiempo de vida en ticks (~5 segundos)

        // Crear el sprite del arpón
        this.sprite = new PIXI.Sprite(PIXI.Texture.from("sprites/arpon/derecha.png"));
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.25);
        this.sprite.x = startX;
        this.sprite.y = startY;

        // Calcular la dirección normalizada hacia el objetivo
        const dx = targetX - startX;
        const dy = targetY - startY;
        const magnitud = Math.sqrt(dx * dx + dy * dy);
        this.velocidadX = (dx / magnitud) * this.velocidad;
        this.velocidadY = (dy / magnitud) * this.velocidad;

        // Ajustar la rotación del arpón para que apunte hacia el objetivo
        this.sprite.rotation = Math.atan2(dy, dx);

        // Agregar el sprite al escenario
        app.stage.addChild(this.sprite);

        // Iniciar el movimiento del arpón
        PIXI.Ticker.shared.add(this.mover, this);
    }

    mover() {
        // Actualizar la posición del arpón
        this.sprite.x += this.velocidadX;
        this.sprite.y += this.velocidadY;

        // Reducir el tiempo de vida
        this.tiempoVida--;

        // Eliminar el arpón si su tiempo de vida se agota
        if (this.tiempoVida <= 0) {
            this.desaparecer();
        }
    }

    desaparecer() {
        PIXI.Ticker.shared.remove(this.mover, this);
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}
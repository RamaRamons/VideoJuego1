class Tutorial {
    constructor(juego) {
        this.juego = juego;

        this.container = new PIXI.Container();

        // Crear fondo del contador
        const tutorial = PIXI.Texture.from('sprites/hud/Tutorial.png');
        this.fondo = new PIXI.Sprite(tutorial);
        this.fondo.width = 120; 
        this.fondo.height = 90;

        // Agregar fondo y texto al contenedor
        this.container.addChild(this.fondo);

        this.container.zIndex = 100;

        // Añadir el contenedor al stage
        juego.app.stage.addChild(this.container);

        juego.app.stage.sortChildren();
    }

    update() {
        const centro = this.juego.calcularCentro();
        this.container.x = centro.x - (this.juego.app.renderer.width / 2) + 20;
        this.container.y = centro.y + (this.juego.app.renderer.height / 1.5) - 220;
    }
}
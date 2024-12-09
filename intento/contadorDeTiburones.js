class Contador {
    constructor(juego, maximo, listaObjetos) {
        this.juego = juego;
        this.maximo = maximo; // Asegúrate de inicializar correctamente
        this.listaObjetos = listaObjetos;

        this.container = new PIXI.Container();

        // Crear fondo del contador
        const texturaFondo = PIXI.Texture.from('sprites/hud/ContadorDeTiburones.png');
        this.fondo = new PIXI.Sprite(texturaFondo);
        this.fondo.width = 250; 
        this.fondo.height = 125;

        // Crear texto del contador
        this.texto = new PIXI.Text(`${this.listaObjetos.length} / ${this.maximo}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 'white',
            align: 'center'
        });

        this.texto.anchor.set(0.5, 0.5);
        this.texto.x = this.fondo.width / 2 + 40;
        this.texto.y = this.fondo.height / 2 - 7.5;

        // Agregar fondo y texto al contenedor
        this.container.addChild(this.fondo);
        this.container.addChild(this.texto);

        this.container.zIndex = 100;

        // Añadir el contenedor al stage
        juego.app.stage.addChild(this.container);

        // Registrar la actualización en el ticker
        juego.app.ticker.add(() => this.update());

        juego.app.stage.sortChildren();
    }

    update() {
        const contador = this.listaObjetos.length;
        this.texto.text = `${contador} / ${this.maximo}`; 

        const centro = this.juego.calcularCentro(); 
        this.container.x = centro.x + (this.juego.app.renderer.width / 2) - this.fondo.width - 20;
        this.container.y = centro.y - (this.juego.app.renderer.height / 2) + 20;
    }
}
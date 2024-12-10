class BarraVida {
    constructor(juego, maximo, listaObjetos) {
        this.juego = juego;
        this.maximo = maximo;
        this.listaObjetos = listaObjetos;

        // Crear el contenedor para la barra de vida
        this.container = new PIXI.Container();
        //console.log('Contenedor creado:', this.container);

        // Crear la barra de fondo (gris)
        this.fondo = new PIXI.Graphics();
        this.fondo.beginFill(0x777777); // Gris
        this.fondo.drawRect(0, 0, 250, 35); // Ancho y alto de la barra
        this.fondo.endFill();

        // Crear la barra de vida (verde)
        this.vida = new PIXI.Graphics();
        this.vida.beginFill(0x00CC66); // Verde
        this.vida.drawRect(0, 0, 100, 20); // Ancho y alto de la barra
        this.vida.endFill();

        // Crear el texto de la vida
        this.textoVida = new PIXI.Text('', { fontSize: 18, fill: 0x003333, align: 'center', fontWeight: 'bold' });
        this.textoVida.x = 300; // Posicionar el texto en el centro de la barra de vida
        this.textoVida.y = 7;   // Ajustar la posición vertical para que quede centrado en la barra

        // Añadir los gráficos al contenedor
        this.container.addChild(this.fondo);
        this.container.addChild(this.vida);
        this.container.addChild(this.textoVida);

        this.container.zIndex = 100;

        // Añadir el contenedor al escenario
        this.juego.app.stage.addChild(this.container);
        //console.log('Contenedor agregado al stage:', this.container);

        this.imagenDecorativa = new PIXI.Sprite.from('sprites/barradevida/BarraDeVida.png');  // Ruta de la imagen
        this.container.addChild(this.imagenDecorativa);
        this.imagenDecorativa.scale.x = 0.5;
        this.imagenDecorativa.scale.y = 0.51;

        this.imagenDecorativa.x = -10
        this.imagenDecorativa.y = -10
        
        this.container.x = 20; // Desplazamiento horizontal
        this.container.y = 20; // Desplazamiento vertical

        juego.app.stage.sortChildren();
    }

    actualizarVida() {
        if (!this.vida) {
            console.error("La barra de vida no está definida.");
            return;
        }

        const vidaActual = this.listaObjetos.length;
        const vidaPorcentaje = vidaActual / this.maximo; // Relación entre lo que hay y el máximo

        this.vida.clear();
        this.vida.beginFill(0x00CC66); // Verde
        this.vida.drawRect(0, 0, 250 * vidaPorcentaje, 35); // Tamaño proporcional a la vida actual
        this.vida.endFill();

        this.textoVida.text = `${vidaActual} / ${this.maximo}`; // Muestra la vida actual y el máximo
    }

    update() {
        this.actualizarVida();

        const centro = this.juego.calcularCentro();

        this.container.x = centro.x - (this.juego.app.renderer.width / 2) + 30;
        this.container.y = centro.y - (this.juego.app.renderer.height / 2) + 30;
        
        const vidaAncho = this.fondo.width;
        const textoAncho = this.textoVida.width;

        this.textoVida.x = (vidaAncho - textoAncho) / 2;

    }
}
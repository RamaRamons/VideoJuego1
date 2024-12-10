class Contador {
    constructor(juego) {
        this.juego = juego;
        this.container = new PIXI.Container();

        // Crear fondo del contador
        const texturaFondo = PIXI.Texture.from('sprites/hud/ContadorDeTiburones.png');
        this.fondo = new PIXI.Sprite(texturaFondo);
        this.fondo.width = 150;
        this.fondo.height = 75;

        // Crear los textos separados
        this.textoIzquierda = new PIXI.Text('0', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 'yellow',
            align: 'center'
        });
        this.textoIzquierda.anchor.set(0.5, 0.5);
        this.textoIzquierda.x = this.fondo.width / 1.7;
        this.textoIzquierda.y = this.fondo.height / 2.2;

        this.textoBarra = new PIXI.Text('/', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 'yellow',
            align: 'center'
        });
        this.textoBarra.anchor.set(0.5, 0.5);
        this.textoBarra.x = this.fondo.width / 1.5;
        this.textoBarra.y = this.fondo.height / 2.2;

        this.textoDerecha = new PIXI.Text('0', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 'yellow',
            align: 'center'
        });
        this.textoDerecha.anchor.set(0.5, 0.5);
        this.textoDerecha.x = this.fondo.width * 3 / 4;
        this.textoDerecha.y = this.fondo.height / 2.2;

        // Agregar fondo y textos al contenedor
        this.container.addChild(this.fondo);
        this.container.addChild(this.textoIzquierda);
        this.container.addChild(this.textoBarra);
        this.container.addChild(this.textoDerecha);

        this.container.zIndex = 100;

        // Añadir el contenedor al stage
        juego.app.stage.addChild(this.container);

        // Inicializar puntuación
        this.puntajeDerecha = 0;
        this.puntajeIzquierda = 0;

        // Estado de la ronda
        this.rondaEnCurso = true;

        // Registrar la actualización en el ticker
        juego.app.ticker.add(() => this.update());

        juego.app.stage.sortChildren();
    }

    // Método para incrementar el contador
    incrementarContador() {
        if (this.rondaEnCurso) {
            this.puntajeIzquierda += 1;
            this.textoIzquierda.text = `${this.puntajeIzquierda}`;
        }
    }

    // Método para gestionar el final de la ronda
    finalizarRonda() {
        // Si el puntaje izquierdo es mayor que el derecho, incrementar el derecho
        if (this.puntajeIzquierda > this.puntajeDerecha) {
            this.textoDerecha.text = `${this.puntajeIzquierda}`;
        }

        // Reiniciar el puntaje izquierdo a 0
        this.puntajeIzquierda = 0;
        this.textoIzquierda.text = '0';

        // Cambiar el estado de la ronda
        this.rondaEnCurso = false;

        // Si quieres que la ronda vuelva a empezar después de un tiempo
        setTimeout(() => {
            this.rondaEnCurso = true;
        }, 3000); // Aquí puedes ajustar el tiempo que debe esperar
    }

    // Método para modificar el valor de la ronda (nuevo valor)
    modificarRonda(nuevaRonda) {
        // Modificar la ronda en curso
        this.rondaEnCurso = nuevaRonda;

        // Si la ronda es falsa, reiniciar los puntajes
        if (!nuevaRonda) {
            this.puntajeIzquierda = 0;
            this.puntajeDerecha = 0;
            this.textoIzquierda.text = '0';
            this.textoDerecha.text = '0';
        }

        // Si la ronda es verdadera, puedes hacer alguna acción extra si es necesario
        if (nuevaRonda) {
            // Puedes añadir lógica adicional aquí si deseas modificar la lógica cuando se empieza una nueva ronda
        }
    }

    update() {
        // Actualiza la puntuación de la derecha si es necesario
        const centro = this.juego.calcularCentro();
        this.container.x = centro.x + (this.juego.app.renderer.width / 2) - this.fondo.width - 20;
        this.container.y = centro.y - (this.juego.app.renderer.height / 2) + 20;
    }
}

class Juego {
    constructor() {
        // Crear el escenario de PixiJS
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
        document.body.appendChild(this.app.view);
        globalThis.__PIXI_APP__ = this.app;
    
        // Configurar MatterJS
        this.engine = Matter.Engine.create();
        this.contadorDeFrames = 0
        this.world = this.engine.world;
        this.gravity = this.world.gravity;
        this.gravity.scale = 0.0003; // Gravedad baja para simular agua
    
        // Crear un runner para MatterJS
        this.runner = Matter.Runner.create();
        Matter.Runner.run(this.runner, this.engine);
    
        // Añadir fondo al escenario
        this.ponerFondo();
        this.agregarFiltroAgua();
        this.agregarEfectoAgua();

        this.peces = [];
        this.enemigos = [];
    
        // Crear la rejilla (Grid)
        const cellSize = 100; // Tamaño de celda (ajustable)
        this.grid = new Grid(cellSize, this);
    
        // Crear 20 peces en el centro
        for (let i = 0; i < 20; i++) {
            const pez = new Pez(this, 4500 , 4500, 1.5, 100, 1);
            this.peces.push(pez);
            this.grid.add(pez); // Añadir a la rejilla
        }
        
        
    
        // Inicializar la cámara
        this.camera = new Camera();
        this.ultimaPosicion = { x: this.app.renderer.width / 2, y: this.app.renderer.height / 2 };


        this.camaraFija = false; // Indica si la cámara debe quedarse quieta
        this.posicionFinal = { x: 0, y: 0 }; // Última posición del último pez

        this.barraDeVida = new BarraVida(this, this.peces.length, this.peces);
        console.log('Barra de vida creada:', this.barraDeVida); // Depuración
    
        // Cargar los recursos y luego iniciar el jugador
        this.cargarRecursos();
    }
    
    crearEnemigos() {
        // Obtener los JSON cargados desde el loader
        const tiburon1JSON = PIXI.Loader.shared.resources["sprites/tiburones/tiburon1.json"];
        const tiburon2JSON = PIXI.Loader.shared.resources["sprites/tiburones/tiburon2.json"];
    
        // Crear tiburones en posiciones aleatorias
        const stageWidth = 9000;
        const stageHeight = 9000;
        const enemySize = 5;
    
        for (let i = 0; i < 150; i++) {
            const posicionX = Math.random() * (stageWidth - enemySize * 2) + enemySize;
            const posicionY = Math.random() * (stageHeight - enemySize * 2) + enemySize;
            const tiburon = new Tiburon1(this, posicionX, posicionY, 1, tiburon1JSON);
            this.enemigos.push(tiburon);
            this.grid.add(tiburon); // Añadir a la rejilla
        }
    
        for (let i = 0; i < 150; i++) {
            const posicionX = Math.random() * (stageWidth - enemySize * 2) + enemySize;
            const posicionY = Math.random() * (stageHeight - enemySize * 2) + enemySize;
            const tiburon = new Tiburon2(this, posicionX, posicionY, 1, tiburon2JSON);
            this.enemigos.push(tiburon);
            this.grid.add(tiburon); // Añadir a la rejilla
        }
    }

    agregarFiltroAgua() {
        // Asegurarse de que la textura esté correctamente cargada
        const displacementTexture = PIXI.Texture.from("sprites/filtroDeAgua.png");
    
        // Crear el sprite del mapa de desplazamiento
        const displacementSprite = new PIXI.Sprite(displacementTexture);
        
        // Ajustar el tamaño para cubrir toda la pantalla
        displacementSprite.width = this.app.renderer.width;
        displacementSprite.height = this.app.renderer.height;
    
        // Colocar el sprite de desplazamiento detrás de todo el contenido
        this.app.stage.addChild(displacementSprite);
    
        // Crear y aplicar el filtro
        const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
    
        // Aplicar el filtro al escenario (al fondo o a los elementos que quieres que se vean afectados)
        this.app.stage.filters = [displacementFilter];
    
        // Animar el mapa de desplazamiento
        this.app.ticker.add(() => {
            displacementSprite.x += 1.5; // Ajusta la velocidad horizontal
            displacementSprite.y += 0.8; // Ajusta la velocidad vertical
        });
    }    

    agregarEfectoAgua() {
        // Cargar la textura del overlay de agua
        const overlayTexture = PIXI.Texture.from("sprites/efectoAgua.png");
    
        // Crear un TilingSprite del tamaño del fondo
        this.waterOverlay = new PIXI.TilingSprite(
        overlayTexture,
        this.backgroundSprite.width, // Usar el ancho del fondo
        this.backgroundSprite.height // Usar el alto del fondo
        );

        // Posicionar el overlay para que coincida con el fondo
        this.waterOverlay.x = this.backgroundSprite.x;
        this.waterOverlay.y = this.backgroundSprite.y;

        // Añadir el overlay al stage
        this.app.stage.addChild(this.waterOverlay);

        // Animar la posición del tile para simular el movimiento
        this.app.ticker.add(() => {
        this.waterOverlay.tilePosition.x += 0.5; // Velocidad horizontal
        this.waterOverlay.tilePosition.y += 0.3; // Velocidad vertical
        });
    }
    
    ponerFondo() {
        const fondoTexture = PIXI.Texture.from("sprites/fondo/backgroundtest.jpeg");
        this.backgroundSprite = new PIXI.Sprite(fondoTexture);

        this.backgroundSprite.x = 250 * 18;
        this.backgroundSprite.y = 250 * 18;

        this.backgroundSprite.width = 250 * 36;
        this.backgroundSprite.height = 250 * 36;

        this.backgroundSprite.pivot.x = 800;
        this.backgroundSprite.pivot.y = 800;

        
        this.app.stage.addChildAt(this.backgroundSprite, 0);
    }

    cargarRecursos() {
        PIXI.Loader.shared
            .add("sprites/buzo/animacionderecha/BuzoDerecha.json")
            .add("sprites/buzo/animacionizquierda/BuzoIzquierda.json")
            .add("sprites/buzo/animacionarriba/derecha/BuzoDerechaArriba.json")
            .add("sprites/buzo/animacionarriba/izquierda/BuzoIzquierdaArriba.json")
            .add("sprites/buzo/animacionabajo/derecha/BuzoDerechaAbajo.json")
            .add("sprites/buzo/animacionabajo/izquierda/BuzoIzquierdaAbajo.json")
            .add("sprites/tiburones/tiburon1.json")
            .add("sprites/tiburones/tiburon2.json")
            .load(() => {
                // Iniciar el jugador una vez que los recursos están cargados
                this.iniciarJugador();
                this.crearEnemigos();
                // Iniciar el bucle de actualización de PixiJS
                this.app.ticker.add(() => this.update());
            });   
    }

    eliminarPez(pez) {
        // Remover el pez del array de peces
        const index = this.peces.indexOf(pez);
        if (index !== -1) {
            this.peces.splice(index, 1);
        }
    
        // Remover el contenedor del pez del stage
        if (pez.container && pez.container.parent) {
            pez.container.parent.removeChild(pez.container);
        }
    }

    iniciarJugador() {
        // Crear el jugador y pasar la instancia de app al constructor
        this.jugador = new Jugador(this.app); // Pasar 'this.app' al constructor de Jugador
        this.app.stage.addChild(this.jugador.sprite);
    }

    calcularCentro() {
        if (this.peces.length === 0) {
            // Si no quedan peces, devolver la posición fija
            this.camaraFija = true; // Activar modo de cámara fija
            return this.posicionFinal; // Retornar última posición registrada
        }
    
        // Calcular el centro de todos los peces vivos
        let totalX = 0;
        let totalY = 0;
    
        this.peces.forEach((pez) => {
            totalX += pez.x;
            totalY += pez.y;
        });
    
        const centroX = totalX / this.peces.length;
        const centroY = totalY / this.peces.length;
    
        // Registrar la posición del último pez vivo
        this.posicionFinal = { x: centroX, y: centroY };
    
        return { x: centroX, y: centroY };
    }

    update() {
        const centro = this.calcularCentro();
        //esto hace que el stage este centrado en el medio de la pantalla
        if (!this.camaraFija) {
            // Si la cámara no está fija, sigue a los peces
            this.app.stage.position.x = this.app.renderer.width / 2;
            this.app.stage.position.y = this.app.renderer.height / 2;
    
            this.app.stage.pivot.x = centro.x;
            this.app.stage.pivot.y = centro.y;
    
            // Ajustar la posición del filtro de agua
            this.waterOverlay.x = centro.x - this.app.renderer.width / 2;
            this.waterOverlay.y = centro.y - this.app.renderer.height / 2;
        }
        

        // Mantener los efectos visuales como el filtro y overlay
        this.waterOverlay.tilePosition.x += 0.5;
        this.waterOverlay.tilePosition.y += 0.3;

        // Otros cálculos y actualizaciones
        if (this.jugador) {
            this.jugador.apuntarHaciaMouse(
            this.app.renderer.plugins.interaction.mouse.global.x,
            this.app.renderer.plugins.interaction.mouse.global.y
        );
    
        // Animar el filtro de agua
        if (this.displacementSprite) {
            this.displacementSprite.time += 0.05;} // Incrementar el tiempo para animar las ondas

        for (let pez of this.peces) {
            pez.update(this.peces);}

        for (let enemigo of this.enemigos) {
            enemigo.update();}
    

        if (this.jugador) {
            this.jugador.apuntarHaciaMouse(this.app.renderer.plugins.interaction.mouse.global.x, this.app.renderer.plugins.interaction.mouse.global.y);
        }
        this.barraDeVida.update()
      }
    }
}

// Inicializar el juego
const juego = new Juego();

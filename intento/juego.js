class Juego {
    constructor() {
        // Crear el escenario de PixiJS
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
        document.body.appendChild(this.app.view);
        globalThis.__PIXI_APP__ = this.app;
    
        // Configurar MatterJS
        this.engine = Matter.Engine.create();
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
            const pez = new Pez(this, window.innerWidth / 2, window.innerHeight / 2, 1, 100, 1);
            this.peces.push(pez);
            this.grid.add(pez); // Añadir a la rejilla
        }
    
        // Crear tiburones en posiciones aleatorias
        const stageWidth = 3000;
        const stageHeight = 3000;
        const enemySize = 15;
    
        for (let i = 0; i < 10; i++) {
            const posicionX = Math.random() * (stageWidth - enemySize * 2) + enemySize;
            const posicionY = Math.random() * (stageHeight - enemySize * 2) + enemySize;
            const tiburon = new Tiburon1(this, posicionX, posicionY, 1);
            this.enemigos.push(tiburon);
            this.grid.add(tiburon); // Añadir a la rejilla
        }
    
        for (let i = 0; i < 10; i++) {
            const posicionX = Math.random() * (stageWidth - enemySize * 2) + enemySize;
            const posicionY = Math.random() * (stageHeight - enemySize * 2) + enemySize;
            const tiburon = new Tiburon2(this, posicionX, posicionY, 1);
            this.enemigos.push(tiburon);
            this.grid.add(tiburon); // Añadir a la rejilla
        }
    
        // Inicializar la cámara
        this.camera = new Camera();
        this.ultimaPosicion = { x: this.app.renderer.width / 2, y: this.app.renderer.height / 2 };
    
        // Cargar los recursos y luego iniciar el jugador
        this.cargarRecursos();
    }    

    agregarFiltroAgua() {
        // Crear el sprite del mapa de desplazamiento
        const displacementTexture = PIXI.Texture.from("sprites/filtroDeAgua.png");
        const displacementSprite = new PIXI.Sprite(displacementTexture);
    
        // Ajustar el tamaño para cubrir toda la pantalla
        displacementSprite.width = this.app.renderer.width;
        displacementSprite.height = this.app.renderer.height;
    
        // Añadir el sprite al stage (fuera del render visible)
        this.app.stage.addChild(displacementSprite);
    
        // Crear y aplicar el filtro
        const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
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
        const fondoTexture = PIXI.Texture.from("sprites/background.jpeg");
        this.backgroundSprite = new PIXI.Sprite(fondoTexture);
        this.backgroundSprite.width = 3000;
        this.backgroundSprite.height = 3000;
        this.backgroundSprite.x = 0;
        this.backgroundSprite.y = 0;
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
            .load(() => {
                // Iniciar el jugador una vez que los recursos están cargados
                this.iniciarJugador();
                // Iniciar el bucle de actualización de PixiJS
                this.app.ticker.add(() => this.update());
            });
    }

    iniciarJugador() {
        // Crear el jugador y pasar la instancia de app al constructor
        this.jugador = new Jugador(this.app); // Pasar 'this.app' al constructor de Jugador
        this.app.stage.addChild(this.jugador.sprite);
    }

    calcularCentro() {
        let totalX = 0;
        let totalY = 0;

        this.peces.forEach((pez) => {
            totalX += pez.x;
            totalY += pez.y;
        });

        const centroX = totalX / this.peces.length;
        const centroY = totalY / this.peces.length;
        
        if (this.peces.length === 0) {
            return this.ultimaPosicion;
        }
        this.ultimaPosicion = { x: centroX, y: centroY };

        return { x: centroX, y: centroY };
    }

    update() {
        const centro = this.calcularCentro();

        this.app.stage.pivot.x = centro.x;
        this.app.stage.pivot.y = centro.y;
        this.app.stage.position.x = this.app.renderer.width / 2;
        this.app.stage.position.y = this.app.renderer.height / 2;

        this.backgroundSprite.x = centro.x - this.app.renderer.width / 2;
        this.backgroundSprite.y = centro.y - this.app.renderer.height / 2;

        // Asegúrate de que el overlay también siga al fondo
        this.waterOverlay.x = this.backgroundSprite.x;
        this.waterOverlay.y = this.backgroundSprite.y;

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
        if (this.waterFilter) {
            this.waterFilter.time += 0.05;} // Incrementar el tiempo para animar las ondas

        for (let pez of this.peces) {
            pez.update(this.peces);}

        for (let enemigo of this.enemigos) {
            enemigo.update(this.peces, this.enemigos);}

        const centro = this.calcularCentro();
        
        this.app.stage.pivot.x = centro.x;
        this.app.stage.pivot.y = centro.y;
        this.app.stage.position.x = this.app.renderer.width / 2;
        this.app.stage.position.y = this.app.renderer.height / 2;
        
        this.backgroundSprite.x = centro.x - this.app.renderer.width;
        this.backgroundSprite.y = centro.y - this.app.renderer.height;

        if (this.jugador) {
            this.jugador.apuntarHaciaMouse(this.app.renderer.plugins.interaction.mouse.global.x, this.app.renderer.plugins.interaction.mouse.global.y);
        }
      }
    }
}

// Inicializar el juego
const juego = new Juego();

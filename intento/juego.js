class Juego {
  constructor() {
      // Crear el escenario de PixiJS
      this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
      document.body.appendChild(this.app.view);

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

      this.peces = [];
      this.enemigos = []; // Inicializar el array de enemigos

      // Crear 20 peces en el centro
      for (let i = 0; i < 20; i++) {
          this.peces.push(new Pez(this, window.innerWidth / 2, window.innerHeight / 2, 0.5, 100, 5));
      }

      // Crear 5 Tiburon1
      for (let i = 0; i < 5; i++) {
          this.enemigos.push(new Tiburon1(this, Math.random() * window.innerWidth, Math.random() * window.innerHeight, 1));
      }

      // Crear 5 Tiburon2
      for (let i = 0; i < 5; i++) {
          this.enemigos.push(new Tiburon2(this, Math.random() * window.innerWidth, Math.random() * window.innerHeight, 1));
      }

      // Inicializar la cámara
      this.camera = new Camera();

      // Iniciar el loop de actualización de PixiJS
      this.app.ticker.add(() => this.update());
  }

  ponerFondo() {
      // Cargar la textura de la imagen del fondo
      const fondoTexture = PIXI.Texture.from("sprites/background.jpeg");
      
      // Crear un sprite con la textura del fondo
      this.backgroundSprite = new PIXI.Sprite(fondoTexture);

      // Ajustar el tamaño del fondo
      this.backgroundSprite.width = 3000; // Ajusta según sea necesario
      this.backgroundSprite.height = 3000; // Ajusta según sea necesario

      // Posicionar el fondo en la capa más baja del stage
      this.backgroundSprite.x = 0; // Asegúrate de que esté en la posición correcta
      this.backgroundSprite.y = 0;
      
      // Agregar el fondo al escenario
      this.app.stage.addChildAt(this.backgroundSprite, 0);
  }

  update() {
      // Actualizar peces y enemigos
      for (let pez of this.peces) {
          pez.update(this.peces);
      }

      // Actualizar enemigos
      for (let enemigo of this.enemigos) {
          enemigo.update(this.peces);
      }

      // Si hay al menos un pez, la cámara seguirá al primer pez
      if (this.peces.length > 0) {
          this.camera.follow(this.peces[0]); // Cambia el índice según cuál pez seguir
      }
  }
}

// Inicializar el juego
const juego = new Juego();

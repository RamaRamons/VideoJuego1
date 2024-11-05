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
          this.peces.push(new Pez(this, window.innerWidth / 2, window.innerHeight / 2, 1, 100, 1));
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

      this.ultimaPosicion = { x: this.app.renderer.width / 2, y: this.app.renderer.height / 2 }; // Posición inicial predeterminada

      // Iniciar el loop de actualización de PixiJS
      this.app.ticker.add(() => this.update());
  }
  calcularCentro() {
    

    // Calcular el centro de los peces
    let totalX = 0;
    let totalY = 0;

    this.peces.forEach((pez) => {
        totalX += pez.x;
        totalY += pez.y;
    });

    // Calcular el promedio de las posiciones
    const centroX = totalX / this.peces.length;
    const centroY = totalY / this.peces.length;

    
    if (this.peces.length === 0) {
        // Si no hay peces, devolver la última posición conocida
        return this.ultimaPosicion;
    }
    this.ultimaPosicion = { x: centroX, y: centroY };

    return { x: centroX, y: centroY };
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
      const centro = this.calcularCentro();
      

      // Ajustar la posición del contenedor para que el centro esté en el centro de la pantalla
      this.app.stage.pivot.x = centro.x;
      this.app.stage.pivot.y = centro.y;

      // Asegurarse de que el centro esté en el medio de la pantalla
      this.app.stage.position.x = this.app.renderer.width / 2;
      this.app.stage.position.y = this.app.renderer.height / 2;
      
      this.backgroundSprite.x = centro.x - this.app.renderer.width;
      this.backgroundSprite.y = centro.y - this.app.renderer.height;
  }
}

// Inicializar el juego
const juego = new Juego();

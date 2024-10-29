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
    Matter.Runner.run(this.runner, this.engine); // Ejecutar el motor con el runner

    this.puntos = [];

    // Crear 20 peces juntos al centro
    this.peces = [];
    for (let i = 0; i < 20; i++) {
      this.peces.push(new Pez(this, window.innerWidth / 2, window.innerHeight / 2, 1, 100));
    }

    // Crear 10 enemigos
    this.enemigos = [];
    for (let i = 0; i < 10; i++) {
      this.enemigos.push(new Enemigo(this, Math.random() * window.innerWidth, Math.random() * window.innerHeight, 1));
    }

    // Variable para controlar la generación continua de puntos
    this.generarPuntosContinuos = null;

    // Iniciar el loop de actualización de PixiJS
    this.app.ticker.add(() => this.update());

    // Variable para almacenar la posición actual del mouse
    this.mousePos = { x: 0, y: 0 };

    // Event listeners para manejar la generación continua de comida
    this.app.view.addEventListener('mousedown', () => this.iniciarGeneracionComida());
    this.app.view.addEventListener('mouseup', () => this.detenerGeneracionComida());
    this.app.view.addEventListener('mousemove', (event) => this.actualizarPosicionMouse(event));
  }

  actualizarPosicionMouse(event) {
    // Actualizar la posición actual del mouse
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;
  }

  iniciarGeneracionComida() {
    // Inicia la generación continua de puntos solo si no está ya en marcha
    if (!this.generarPuntosContinuos) {
      this.generarPuntosContinuos = setInterval(() => this.generarPunto(this.mousePos), 100);
    }
  }

  detenerGeneracionComida() {
    // Detiene la generación de puntos cuando se suelta el mouse
    clearInterval(this.generarPuntosContinuos);
    this.generarPuntosContinuos = null;
  }

  generarPunto(posicionMouse) {
    const x = posicionMouse.x;
    const y = posicionMouse.y;

    // Crear el punto rojo con velocidad de caída lenta
    const punto = Matter.Bodies.circle(x, y, 5, {
      restitution: 0.3, // Rebote moderado
      frictionAir: 0.1, // Mayor fricción con el aire para simular agua
      label: 'comida'
    });
    Matter.World.add(this.world, punto); // Añadir el cuerpo al mundo de MatterJS

    // Crear la representación gráfica en PixiJS
    const graficoPunto = new PIXI.Graphics();
    graficoPunto.beginFill(0xFF0000); // Rojo
    graficoPunto.drawCircle(0, 0, 5);
    graficoPunto.endFill();
    this.app.stage.addChild(graficoPunto);

    // Almacenar el cuerpo físico y su representación gráfica
    const comida = { cuerpo: punto, grafico: graficoPunto };
    this.puntos.push(comida);

    // Configurar la eliminación de la comida tras 10 segundos
    setTimeout(() => {
      if (this.puntos.includes(comida)) {
        this.app.stage.removeChild(graficoPunto);
        Matter.World.remove(this.world, punto);
        this.puntos.splice(this.puntos.indexOf(comida), 1);
      }
    }, 10000); // Desaparece después de 10 segundos
  }

  update() {
    // Actualizar la posición de los puntitos rojos según el motor de física
    for (const punto of this.puntos) {
      punto.grafico.x = punto.cuerpo.position.x;
      punto.grafico.y = punto.cuerpo.position.y;
    }

    // Actualizar peces
    for (let pez of this.peces) {
      pez.update(this.puntos, this.peces); // Actualizar peces con la lista de comida y otros peces
    }

    // Actualizar enemigos
    for (let enemigo of this.enemigos) {
      enemigo.update(this.puntos); // Actualizar enemigos con la lista de comida
    }
  }
}

// Inicializar el juego
const juego = new Juego();

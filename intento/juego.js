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
    this.entidades = [];
    
    // Generar la entidad que persigue la comida
    this.entidad = new EntidadPersigue(this, window.innerWidth / 2, window.innerHeight / 2, 2, 200);

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

    // Almacenar el cuerpo físico, su representación gráfica y un temporizador
    const comida = { cuerpo: punto, grafico: graficoPunto, tiempoVida: 10000 }; // 10 segundos de vida
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
    // Actualizar la entidad que persigue la comida
    this.entidad.update(this.puntos);

    // Actualizar la posición de los puntitos rojos según el motor de física
    for (const punto of this.puntos) {
      punto.grafico.x = punto.cuerpo.position.x;
      punto.grafico.y = punto.cuerpo.position.y;
    }
  }
}

class EntidadPersigue {
  constructor(juego, x, y, velocidad, radioPersecucion) {
    this.juego = juego;
    this.x = x;
    this.y = y;
    this.velocidad = velocidad;
    this.radioPersecucion = radioPersecucion;

    // Crear la representación gráfica de la entidad (azul)
    this.grafico = new PIXI.Graphics();
    this.grafico.beginFill(0x0000FF); // Azul
    this.grafico.drawCircle(0, 0, 10); // Radio del círculo de la entidad
    this.grafico.endFill();
    this.grafico.x = this.x;
    this.grafico.y = this.y;
    this.juego.app.stage.addChild(this.grafico);
  }

  update(puntos) {
    let puntoObjetivo = null;
    let distanciaMinima = this.radioPersecucion;

    // Buscar el punto rojo más cercano dentro del radio de persecución
    for (const punto of puntos) {
      const dx = punto.cuerpo.position.x - this.x;
      const dy = punto.cuerpo.position.y - this.y;
      const distancia = Math.sqrt(dx * dx + dy * dy);
      
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        puntoObjetivo = punto;
      }
    }

    // Si hay un punto objetivo dentro del radio, moverse hacia él
    if (puntoObjetivo) {
      const dx = puntoObjetivo.cuerpo.position.x - this.x;
      const dy = puntoObjetivo.cuerpo.position.y - this.y;
      const angulo = Math.atan2(dy, dx);

      this.x += Math.cos(angulo) * this.velocidad;
      this.y += Math.sin(angulo) * this.velocidad;

      // Verificar colisión
      if (distanciaMinima < 10) {
        this.juego.app.stage.removeChild(puntoObjetivo.grafico);
        Matter.World.remove(this.juego.world, puntoObjetivo.cuerpo);
        this.juego.puntos.splice(this.juego.puntos.indexOf(puntoObjetivo), 1);
      }
    } else {
      // Movimiento aleatorio si no hay punto en el radio
      this.x += (Math.random() - 0.5) * this.velocidad;
      this.y += (Math.random() - 0.5) * this.velocidad;
    }

    // Actualizar la posición gráfica de la entidad
    this.grafico.x = this.x;
    this.grafico.y = this.y;
  }
}

/*class Juego {
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
      });
      Matter.World.add(this.world, punto); // Añadir el cuerpo al mundo de MatterJS
  
      // Crear la representación gráfica en PixiJS
      const graficoPunto = new PIXI.Graphics();
      graficoPunto.beginFill(0xFF0000); // Rojo
      graficoPunto.drawCircle(0, 0, 5);
      graficoPunto.endFill();
      this.app.stage.addChild(graficoPunto);
  
      // Almacenar el cuerpo físico y su representación gráfica
      this.puntos.push({ cuerpo: punto, grafico: graficoPunto });
    }
  
    update() {
      // Actualizar la posición de los puntitos rojos según el motor de física
      for (const punto of this.puntos) {
        punto.grafico.x = punto.cuerpo.position.x;
        punto.grafico.y = punto.cuerpo.position.y;
      }
    }
}*/


  function generateRandomID(length = 8) {
    // Conjunto de caracteres alfanuméricos (mayúsculas, minúsculas y dígitos)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    // Genera un ID al azar
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}

function limitMagnitude(vector, maxMagnitude) {
  // Calcular la magnitud actual del vector
  const currentMagnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  // Si la magnitud actual es mayor que la máxima permitida, limitar el vector
  if (currentMagnitude > maxMagnitude) {
    const scale = maxMagnitude / currentMagnitude;
    vector.x *= scale;
    vector.y *= scale;
  }

  return vector;
}

function distancia(obj1, obj2) {
  return Math.sqrt((obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2);
}

  // Inicializar el juego
  const juego = new Juego();

  
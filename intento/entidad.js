class Entidad {
    constructor(x, y, juego) {
      this.x = x;
      this.y = y;
      this.juego = juego;
  
      // Crear la representación gráfica de la entidad (magenta)
      this.container = new PIXI.Graphics();
      this.container.beginFill(0xFF00FF); // Magenta
      this.container.drawCircle(0, 0, 10); // Radio del círculo de la entidad
      this.container.endFill();
      this.container.x = this.x;
      this.container.y = this.y;
      this.juego.app.stage.addChild(this.container);
    }
  
    update() {
      // Las entidades magenta no se moverán
      this.container.x = this.x;
      this.container.y = this.y;
    }
  }
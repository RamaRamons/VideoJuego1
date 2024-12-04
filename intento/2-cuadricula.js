class Cell {
    constructor(x, y, juego) {
      this.x = x;
      this.y = y;
      this.juego = juego;
      this.objetos = []; // Almacena los objetos que están en esta celda
    }
  
    agregar(objeto) {
      this.objetos.push(objeto);
      objeto.miCeldaActual = this; // Referencia a la celda en la que se encuentra el objeto
    }
  
    sacar(objeto) {
      const index = this.objetos.indexOf(objeto);
      if (index !== -1) {
        this.objetos.splice(index, 1);
        objeto.miCeldaActual = null;
      }
    }
  
    obtenerCeldasVecinas() {
      let vecinos = [];
      const margen = 1; // Incluye las celdas adyacentes
      for (let i = this.x - margen; i <= this.x + margen; i++) {
        for (let j = this.y - margen; j <= this.y + margen; j++) {
          const cell = this.juego.grid.getCell(i, j);
          if (cell && cell !== this) {
            vecinos.push(cell);
          }
        }
      }
      return vecinos;
    }
  }
  
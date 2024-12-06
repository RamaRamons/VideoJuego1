class Celda {
    constructor(x, y, juego) {
      this.x = x;
      this.y = y;
      this.juego = juego;
  
      this.objetosAca = {};
    }
    agregar(obj) {
      this.objetosAca[obj.id] = obj;
      obj.miCeldaActual = this;
    }
    sacar(obj) {
      obj.miCeldaActual = null;
      delete this.objetosAca[obj.id];
    }
    cuantosObjetos() {
      return Object.keys(this.objetosAca).length;
    }
    obtenerCeldasVecinas() {
      let vecinos = [];
  
      const margen = 1;
      // Revisar celdas adyacentes
      for (let i = this.x - margen; i <= this.x + margen; i++) {
        for (let j = this.y - margen; j <= this.y + margen; j++) {
          const celda = this.juego.grid.getCell(i, j);
  
          if (celda && celda != this) {
            vecinos.push(celda);
          }
        }
      }
      return vecinos;
    }
  }
  
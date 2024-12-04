class Grid {
    constructor(cellSize, juego) {
        this.cellSize = cellSize;
        this.juego = juego;

        // Determinar el número de columnas y filas basado en el tamaño del escenario
        this.columns = Math.ceil(3000 / this.cellSize); // Ajustar según el tamaño de tu mapa
        this.rows = Math.ceil(3000 / this.cellSize);

        // Crear una matriz 2D para las celdas
        this.cells = [];
        for (let row = 0; row < this.rows; row++) {
            const rowArray = [];
            for (let col = 0; col < this.columns; col++) {
                rowArray.push({ objetos: [] }); // Celda básica con un arreglo para objetos
            }
            this.cells.push(rowArray);
        }
    }

    getCell(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (col < 0 || col >= this.columns || row < 0 || row >= this.rows) {
            return null; // Evitar valores fuera del rango
        }

        return this.cells[row][col];
    }

    add(objeto) {
        const celda = this.getCell(objeto.x, objeto.y);
        if (!celda) {
            console.warn(`El objeto está fuera de la cuadrícula. x: ${objeto.x}, y: ${objeto.y}`);
            return;
        }
        celda.objetos.push(objeto);
    }
  
    remove(objeto) {
      if (objeto.miCeldaActual) {
        objeto.miCeldaActual.sacar(objeto);
      }
    }
  
    actualizarCantidadSiLasCeldasSonPasablesONo() {
      //ESTO ES UN EXPERIMENTO
      for (let i = 0; i < this.cells.length; i++) {
        for (let j = 0; j < this.cells[i].length; j++) {
          let cell = this.cells[i][j];
          if (cell) cell.actualizarSiEsPasableONo();
        }
      }
    }
  
    update(objeto) {
      this.remove(objeto); // Eliminar el objeto de su celda actual
      this.add(objeto); // Volver a agregar el objeto a la celda nueva
    }
  }
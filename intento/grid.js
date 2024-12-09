class Grid {
    constructor(cellSize, juego) {
        this.cellSize = cellSize;
        this.juego = juego;
        
        this.columns = Math.ceil(90); // Ajustar según el tamaño de tu mapa
        this.rows = Math.ceil(90);

        // Crear una matriz 2D para las celdas
        this.cells = [];
        for (let row = 0; row < this.rows; row++) {
            const rowArray = [];
            for (let col = 0; col < this.columns; col++) {
                rowArray.push({
                    objetos: [],
                    agregarObjeto: function (objeto) {
                        if (!this.objetos.includes(objeto)) {
                            this.objetos.push(objeto);
                        }
                    },
                    removeObjeto: function (objeto) {
                        const index = this.objetos.indexOf(objeto);
                        if (index !== -1) {
                            this.objetos.splice(index, 1);
                        }
                    }
                });
            }
            this.cells.push(rowArray);
        }

        this.gridContainer = new PIXI.Container();
        this.juego.app.stage.addChild(this.gridContainer);
        this.dibujarCuadricula();
    }
    update(objeto) {
        this.ajustarPosicion(objeto)
        this.remove(objeto); // Eliminar el objeto de su celda actual
        this.add(objeto); // Volver a agregar el objeto a la celda nueva
    }
    ajustarPosicion(objeto) {
        objeto.x = Math.max(0, Math.min(objeto.x, this.cellSize * this.columns - 1));
        objeto.y = Math.max(0, Math.min(objeto.y, this.cellSize * this.rows - 1));
    }
    dibujarCuadricula() {
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(1, 0xaaaaaa, 1); // Líneas grises con un grosor de 1

        // Dibujar las líneas horizontales y verticales
        for (let i = 0; i <= this.rows; i++) {
            graphics.moveTo(0, i * this.cellSize);
            graphics.lineTo(this.columns * this.cellSize, i * this.cellSize);
        }
        for (let i = 0; i <= this.columns; i++) {
            graphics.moveTo(i * this.cellSize, 0);
            graphics.lineTo(i * this.cellSize, this.rows * this.cellSize);
        }
        this.gridContainer.addChild(graphics);
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
    obtenerCeldaPorPosicion(x, y) {
        const xIndex = Math.floor(x / this.cellSize);
        const yIndex = Math.floor(y / this.cellSize);

        // Asegúrate de que no se salga de los límites
        if (xIndex >= 0 && xIndex < this.columns && yIndex >= 0 && yIndex < this.rows) {
            return this.cells[yIndex][xIndex]; // Devuelve la celda correcta
        }

        return null; // Si la celda está fuera de los límites
    }
    miCeldaActual(objeto) {
        const cell = this.getCell(objeto.x, objeto.y);  // Usamos las coordenadas del objeto
        if (cell) {
            objeto.miCeldaActual = cell; // Asignamos la celda actual al objeto
        }
        return cell;
    }
    remove(objeto) {
        if (objeto.miCeldaActual) {
            objeto.miCeldaActual.sacar(objeto); // Eliminar objeto de su celda actual
        }
    }
    add(objeto) {
        const cell = this.getCell(objeto.x, objeto.y); // Obtener la nueva celda según las nuevas coordenadas
        if (!cell) {
            console.error("No se pudo encontrar la celda para el objeto:", objeto);
            return;
        }
        objeto.miCeldaActual = cell; // Asignar la celda correcta al objeto
        cell.objetos.push(objeto);    // Agregar el objeto a la celda correspondiente
    }

    // Detectar objetos dentro del rango de visión del tiburón
    obtenerVecinos(tipoObjeto, margen = 1) {
        let vecinos = [];
        const xIndex = Math.floor(this.container.x / this.cellSize);
        const yIndex = Math.floor(this.container.y / this.cellSize);

        // Itera sobre las celdas adyacentes en el rango
        for (let i = -margen; i <= margen; i++) {
            for (let j = -margen; j <= margen; j++) {
                const celda = this.getCell(
                    (xIndex + i) * this.cellSize,
                    (yIndex + j) * this.cellSize
                );

                // Verifica si la celda existe y tiene objetos
                if (celda && Array.isArray(celda.objetos)) {
                    // Filtra solo los objetos que sean instancias de la clase tipoObjeto
                    vecinos = [
                        ...vecinos,
                        ...celda.objetos.filter((obj) => obj instanceof tipoObjeto && obj !== this),
                    ];
                }
            }
        }

        return vecinos;
    }
    getCell(x, y) {
        const xIndex = Math.floor(x / this.cellSize);
        const yIndex = Math.floor(y / this.cellSize);

        // Asegúrate de que no se salga de los límites
        if (xIndex >= 0 && xIndex < this.columns && yIndex >= 0 && yIndex < this.rows) {
            return this.cells[yIndex][xIndex]; // Devuelve la celda correcta
        }

        return null; // Si la celda está fuera de los límites
    }
}
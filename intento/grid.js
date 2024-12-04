class Grid {
    constructor(cellSize, juego) {
        this.cellSize = cellSize;
        this.juego = juego;
        this.columns = Math.ceil(88); // Ajustar según el tamaño de tu mapa
        this.rows = Math.ceil(88);

        // Crear una matriz 2D para las celdas
        this.cells = [];
        for (let row = 0; row < this.rows; row++) {
            const rowArray = [];
            for (let col = 0; col < this.columns; col++) {
                rowArray.push({ objetos: [] }); // Celda básica con un arreglo para objetos
            }
            this.cells.push(rowArray);
        }

        this.gridContainer = new PIXI.Container();
        this.juego.app.stage.addChild(this.gridContainer);
        //this.dibujarCuadricula();
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

    // Detectar objetos dentro del rango de visión del tiburón
    obtenerVecinosEnRango(x, y, rango) {
        const vecinos = [];
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        // Calculamos el radio de visión del tiburón y buscamos en las celdas cercanas
        const rangoCelda = Math.floor(rango / this.cellSize);  // Convertimos el rango a número de celdas

        for (let i = -rangoCelda; i <= rangoCelda; i++) {
            for (let j = -rangoCelda; j <= rangoCelda; j++) {
                const vecinoCol = col + i;
                const vecinoRow = row + j;

                // Verificar si la celda está dentro de los límites de la cuadrícula
                if (vecinoCol >= 0 && vecinoCol < this.columns && vecinoRow >= 0 && vecinoRow < this.rows) {
                    const celda = this.cells[vecinoRow][vecinoCol];
                    vecinos.push(...celda.objetos); // Agregar todos los objetos en esa celda
                }
            }
        }

        return vecinos;
    }
}
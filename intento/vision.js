class Camera {
    constructor() {
        this.x = 0;  // Posición X de la cámara
        this.y = 0;  // Posición Y de la cámara
    }

    // Método para seguir a un objetivo
    follow(target) {
        this.x = target.x - window.innerWidth / 2; // Centrar el objetivo en la pantalla
        this.y = target.y - window.innerHeight / 2;
    }
}

function renderizarObjetos(listaUno, listaDos, aplicacion) {
    aplicacion.stage.removeChildren(); // Limpiar el escenario

    // Agregar el fondo al escenario primero para que esté siempre en el fondo
    aplicacion.stage.addChild(aplicacion.backgroundSprite);

    // Renderizar los peces
    listaUno.forEach(object => {
        object.sprite.x = object.x - camera.x; // Ajustar la posición del pez
        object.sprite.y = object.y - camera.y; // Ajustar la posición del pez
    });

    // Renderizar los enemigos
    listaDos.forEach(object => {
        object.sprite.x = object.x - camera.x; // Ajustar la posición del enemigo
        object.sprite.y = object.y - camera.y; // Ajustar la posición del enemigo
    });
}

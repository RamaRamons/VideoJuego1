function generarID(longitud = 8) {
    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < longitud; i++) {
      id += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return id;
}
function distanciaAlCuadrado(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}
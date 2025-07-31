async function cargarHTML(id, archivo) {
  const contenedor = document.getElementById(id);
  const respuesta = await fetch(archivo);
  const contenido = await respuesta.text();
  contenedor.innerHTML = contenido;
}

window.addEventListener('DOMContentLoaded', () => {
  cargarHTML('header', '../views/partials/header.html');
  //cargarHTML('menu', '../views/partials/menu.html');
  cargarHTML('footer', '../views/partials/footer.html');
});

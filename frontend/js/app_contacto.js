async function cargarFiltros() {
  const resPaises = await fetch('http://localhost:3000/pais');
  const datos = await resPaises.json();

  console.log('cargar filtros');

  const paisSelect = document.getElementById('pais');
  const ciudadSelect = document.getElementById('ciudad');

  const paisesUnicos = [...new Set(datos.map(item => item.pais))];
  paisSelect.innerHTML = '<option value="">-Select-</option>';
  paisesUnicos.forEach(pais => {
    const opt = document.createElement('option');
    opt.value = pais;
    opt.textContent = pais;
    paisSelect.appendChild(opt);
  });

  paisSelect.addEventListener('change', () => {
    const ciudades = datos.filter(item => item.pais === paisSelect.value).map(item => item.ciudad);
     ciudadSelect.innerHTML = '<option value="">-Select-</option>';
    ciudades.forEach(ciudad => {
      const opt = document.createElement('option');
      opt.value = ciudad;
      opt.textContent = ciudad;
      ciudadSelect.appendChild(opt);
    });
  });

  paisSelect.dispatchEvent(new Event('change')); // Inicializar

  // Estilos
  const resEstilos = await fetch('http://localhost:3000/estilos');
  const estilos = await resEstilos.json();
  const estiloContainer = document.getElementById('estilos-container');
   estilos.forEach(estilo => {
    const id = `estilo-${estilo.nombre.toLowerCase().replace(/\s+/g, '-')}`;

    const div = document.createElement('div');
    div.classList.add('checkbox-item');

    div.innerHTML = `
      <input type="checkbox" id="${id}" name="estilos[]" value="${estilo.nombre}">
      <label for="${id}">${estilo.nombre}</label>
    `;

    estiloContainer.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarFiltros();
});
const API_BASE = 'https://dancecongressradar.vercel.app/';

async function mostrarEventos(eventos = {}) {
  const contenedor = document.getElementById('eventos-lista');
  contenedor.innerHTML = '';

  if (eventos.length === 0) {
    contenedor.textContent = 'No hay eventos registrados.';
    return;
  }

  eventos.forEach(evento => {
    const div = document.createElement('article');
    div.className = 'evento-tile';

    div.innerHTML = `

   
      <a href="${evento.enlace_web}" target="_blank">
        <div class="evento-cuadro">
          <h2 class="titulo-evento">${evento.nombre_evento}</h2>
          <div class="detalles-evento">
            <p><strong>Fecha:</strong> ${formatearFecha(evento.fecha_inicio)} al ${formatearFecha(evento.fecha_fin)}</p>
            <p><strong>Ubicación:</strong> ${evento.ciudad}, ${evento.pais}</p>
            <p><strong>Estilos:</strong> ${evento.estilos.join(', ')}</p>
          </div>
        </div>
      </a>

    `;
    contenedor.appendChild(div);
  });
}

async function cargarEventos(filtros = {}) {
  console.log('cargarEventos');
  const params = new URLSearchParams(filtros).toString();
  const url = `${API_BASE}/eventos${params ? '?' + params : ''}`;
  const res = await fetch(url);
  const eventos = await res.json();
  return eventos;
}

//formatos
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('toggle-filtros');
  const panel = document.getElementById('panel-filtros');

  btn.addEventListener('click', () => {
    panel.classList.toggle('abierto');
    panel.classList.toggle('cerrado');
  });
});

async function cargarFiltros() {
  const resPaises = await fetch(`${API_BASE}/pais`);
  const datos = await resPaises.json();

  const paisSelect = document.getElementById('filtro-pais');
  const ciudadSelect = document.getElementById('filtro-ciudad');

  const paisesUnicos = [...new Set(datos.map(item => item.pais))];
  paisSelect.innerHTML = '<option value="">Todas</option>';
  paisesUnicos.forEach(pais => {
    const opt = document.createElement('option');
    opt.value = pais;
    opt.textContent = pais;
    paisSelect.appendChild(opt);
  });

  paisSelect.addEventListener('change', () => {
    const ciudades = datos.filter(item => item.pais === paisSelect.value).map(item => item.ciudad);
    ciudadSelect.innerHTML = '<option value="">Todas</option>';
    ciudades.forEach(ciudad => {
      const opt = document.createElement('option');
      opt.value = ciudad;
      opt.textContent = ciudad;
      ciudadSelect.appendChild(opt);
    });
  });

  paisSelect.dispatchEvent(new Event('change')); // Inicializar

  // Estilos
  const resEstilos = await fetch('${API_BASE}/estilos');
  const estilos = await resEstilos.json();
  const estiloSelect = document.getElementById('filtro-estilo');
  estilos.forEach(estilo => {
    const opt = document.createElement('option');
    opt.value = estilo.nombre;
    opt.textContent = estilo.nombre;
    estiloSelect.appendChild(opt);
  });
}

document.getElementById('form-filtros').addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('filtrar');

  const params = new URLSearchParams();

  const pais = document.getElementById('filtro-pais').value;
  const ciudad = document.getElementById('filtro-ciudad').value;
  const estilo = document.getElementById('filtro-estilo').value;
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;

  if (pais) params.append('pais', pais);
  if (ciudad) params.append('ciudad', ciudad);
  if (estilo) params.append('estilo', estilo);
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);

  const eventos = await cargarEventos({
    pais, ciudad, estilo, desde, hasta
  });
  mostrarEventos(eventos);
});

document.addEventListener('DOMContentLoaded', async () => {
  cargarFiltros(); // mantener esto
  const eventos = await cargarEventos(); // ← llama al backend
  mostrarEventos(eventos);               // ← muestra en pantalla
});



//init
const API_BASE = 'https://dancecongressradar.vercel.app/';
console.log('init');
verificarSesion();

// Cargar países y ciudades
async function cargarDatos() {
  const paisSelect = document.getElementById('pais');
  const ciudadSelect = document.getElementById('ciudad');

  const res = await fetch('${API_BASE}/pais');
  const datos = await res.json();

  // Agrupar ciudades por país
  const agrupado = {};
  datos.forEach(({ pais, ciudad }) => {
    if (!agrupado[pais]) agrupado[pais] = [];
    agrupado[pais].push(ciudad);
  });

  // Llenar select de país
  Object.keys(agrupado).forEach(pais => {
    const option = document.createElement('option');
    option.value = pais;
    option.textContent = pais;
    paisSelect.appendChild(option);
  });

  // Evento: al cambiar país, cargar ciudades
  paisSelect.addEventListener('change', () => {
    const paisSeleccionado = paisSelect.value;
    ciudadSelect.innerHTML = '';
    agrupado[paisSeleccionado].forEach(ciudad => {
      const option = document.createElement('option');
      option.value = ciudad;
      option.textContent = ciudad;
      ciudadSelect.appendChild(option);
    });
  });

  // Cargar ciudades del primer país por defecto
  paisSelect.dispatchEvent(new Event('change'));
}

//Cargar estilos del evento
async function cargarEstilos() {
   // Estilos
  const resEstilos = await fetch('${API_BASE}/estilos');
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

async function verificarSesion() {
  console.log('Llamado a verificar session');

  try {
    const res = await fetch('${API_BASE}/verificar', {
      credentials: 'include' // 👈 esto es CLAVE para mantener la sesión
    });

    if (!res.ok) {
      throw new Error(); // fuerza el catch si no hay sesión
    }else{
        cargarDatos();
        cargarEstilos();
    }
  } catch {
    alert('Debes iniciar sesión para agregar eventos');
    window.location.href = 'login.html';
  }
    
}

document.getElementById('form-evento').addEventListener('submit', async (e) => {
  e.preventDefault();

  const checkboxes = document.querySelectorAll('input[name="estilo"]:checked');
  const estilosSeleccionados = Array.from(checkboxes).map(cb => parseInt(cb.value));

  const datos = {
    pais: document.getElementById('pais').value,
    ciudad: document.getElementById('ciudad').value,
    nombre: document.getElementById('nombre').value,
    fecha_inicio: document.getElementById('fecha_inicio').value,
    fecha_fin: document.getElementById('fecha_fin').value,
    web: document.getElementById('web').value,
    estilos: estilosSeleccionados
  };

  try {
    const res = await fetch('${API_BASE}/eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 👈 Asegura que la cookie de sesión se use
      body: JSON.stringify(datos)
    });

    const resultado = await res.json();
    if (res.ok) {
      alert('Evento guardado correctamente');
      window.location.href = 'eventos.html';
    } else {
      alert('Error: ' + resultado.error);
    }
  } catch (err) {
    alert('Error en la conexión con el servidor');
    console.error(err);
  }
});









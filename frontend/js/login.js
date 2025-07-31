document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que recargue la página

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 👈 Esto es clave para que la cookie se guarde
      body: JSON.stringify({ email, password })
    });

    const resultado = await res.json();

    if (res.ok) {
      alert('Inicio de sesión exitoso');
      window.location.href = 'agregar_evento.html'; // o donde prefieras redirigir
    } else {
      alert('Error: ' + (resultado.error || 'Usuario o contraseña inválidos'));
    }
  } catch (err) {
    console.error('Error al hacer login:', err);
    alert('No se pudo conectar al servidor');
  }
});
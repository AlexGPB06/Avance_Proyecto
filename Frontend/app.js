const API_URL = 'http://localhost:3000/api'; 

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerLink = document.getElementById('registerLink');
const loginLink = document.getElementById('loginLink');
const loginCard = document.querySelector('.login-card');
const registerCard = document.getElementById('registerCard');
const errorMessage = document.getElementById('errorMessage');
const registerErrorMessage = document.getElementById('registerErrorMessage');

// Helper para obtener el token
function getToken() {
    return localStorage.getItem('token');
}

// Alternancia entre login y registro
registerLink?.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
});

loginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
});

// Manejar login (CONECTADO A BD)
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Guardamos el token y usuario si el login es exitoso
            localStorage.setItem('token', data.token); 
            localStorage.setItem('currentUser', username);
            window.location.href = 'Pagina_principal.html';
        } else {
            errorMessage.textContent = data.error || 'Error al iniciar sesión';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error(error);
        errorMessage.textContent = 'Error de conexión con el servidor';
        errorMessage.style.display = 'block';
    }
});

// Manejar registro (CONECTADO A BD)
registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email })
        });

        if (response.ok) {
            alert('¡Registro exitoso! Ahora inicia sesión.');
            registerCard.style.display = 'none';
            loginCard.style.display = 'block';
        } else {
            const data = await response.json();
            registerErrorMessage.textContent = data.message || 'Error al registrarse';
            registerErrorMessage.style.display = 'block';
        }
    } catch (error) {
        registerErrorMessage.textContent = 'Error de conexión';
        registerErrorMessage.style.display = 'block';
    }
});

// ============ MANEJO DE PÁGINA PRINCIPAL ============

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userDisplay')) {
        verificarAutenticacion();
        inicializarPaginaPrincipal();
    }
});

function verificarAutenticacion() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('userDisplay').textContent = `👤 ${currentUser.toUpperCase()}`;
}

function logoutUsuario() {
    localStorage.clear(); // Borra todo (usuario y token)
    window.location.href = 'index.html';
}

document.getElementById('logoutBtn')?.addEventListener('click', logoutUsuario);

function inicializarPaginaPrincipal() {
    // Lógica de pestañas (Menú lateral)
    const menuBtns = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.section');

    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            menuBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            const sectionId = btn.getAttribute('data-section') + 'Section';
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Cargar datos reales desde MySQL
    cargarCanciones();
    cargarFans();
    cargarTareas();
    cargarEventos();
}

// --- GESTIÓN DE CANCIONES ---

async function agregarCancion() {
    const titulo = document.getElementById('cancionTitulo').value.trim();
    const artista = document.getElementById('cancionArtista').value.trim();
    const genero = document.getElementById('cancionGenero').value.trim();

    if (!titulo || !artista) return alert('⚠️ Faltan datos');

    const token = getToken();

    const response = await fetch(`${API_URL}/canciones`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // TOKEN AÑADIDO
        },
        body: JSON.stringify({ titulo, artista, genero })
    });

    if (response.ok) {
        // Limpiar y recargar
        document.getElementById('cancionTitulo').value = '';
        document.getElementById('cancionArtista').value = '';
        document.getElementById('cancionGenero').value = '';
        cargarCanciones();
    } else {
        alert("Error al agregar (¿Sesión expirada?)");
    }
}

async function cargarCanciones() {
    try {
        const response = await fetch(`${API_URL}/canciones`);
        const canciones = await response.json();
        const container = document.getElementById('cancionesContainer');

        if (canciones.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay canciones en la BD.</p>';
            return;
        }

        container.innerHTML = canciones.map(c => `
            <div class="item-card cancion-card">
                <div class="item-header">
                    <h3>🎵 ${c.titulo.toUpperCase()}</h3>
                    <button class="btn-delete" onclick="eliminarCancion(${c.id})">🗑️</button>
                </div>
                <p><strong>ARTISTA:</strong> ${c.artista.toUpperCase()}</p>
                <p><strong>GÉNERO:</strong> ${(c.genero || '---').toUpperCase()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error cargando canciones:", error);
    }
}

async function eliminarCancion(id) {
    if (confirm('¿Eliminar canción?')) {
        const token = getToken();
        await fetch(`${API_URL}/canciones/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` } // TOKEN AÑADIDO
        });
        cargarCanciones();
    }
}

// --- GESTIÓN DE FANS ---

async function agregarUsuario() {
    const nombre = document.getElementById('usuarioNombre').value.trim();
    const email = document.getElementById('usuarioEmail').value.trim();
    const pais = document.getElementById('usuarioPais').value.trim();

    if (!nombre) return alert('Nombre obligatorio');

    const token = getToken();

    await fetch(`${API_URL}/fans`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, email, pais })
    });

    document.getElementById('usuarioNombre').value = '';
    document.getElementById('usuarioEmail').value = '';
    document.getElementById('usuarioPais').value = '';
    cargarFans();
}

async function cargarFans() {
    try {
        const response = await fetch(`${API_URL}/fans`);
        const fans = await response.json();
        const container = document.getElementById('usuariosContainer');

        if (fans.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay fans registrados.</p>';
            return;
        }

        container.innerHTML = fans.map(f => `
            <div class="item-card usuario-card">
                <div class="item-header">
                    <h3>👥 ${f.nombre.toUpperCase()}</h3>
                    <button class="btn-delete" onclick="eliminarFan(${f.id})">🗑️</button>
                </div>
                <p><strong>EMAIL:</strong> ${f.email || '---'}</p>
                <p><strong>PAÍS:</strong> ${(f.pais || '---').toUpperCase()}</p>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function eliminarFan(id) {
    if (confirm('¿Eliminar fan?')) {
        const token = getToken();
        await fetch(`${API_URL}/fans/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        cargarFans();
    }
}

// --- GESTIÓN DE TAREAS ---

async function agregarTarea() {
    const titulo = document.getElementById('tareaTitulo').value.trim();
    const descripcion = document.getElementById('tareaDescripcion').value.trim();
    const prioridad = document.getElementById('tareaPrioridad').value;

    if (!titulo) return alert('Título requerido');

    const token = getToken();

    await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ titulo, descripcion, prioridad })
    });

    document.getElementById('tareaTitulo').value = '';
    document.getElementById('tareaDescripcion').value = '';
    cargarTareas();
}

async function cargarTareas() {
    try {
        const response = await fetch(`${API_URL}/tareas`);
        const tareas = await response.json();
        const container = document.getElementById('tareasContainer');

        if (tareas.length === 0) {
            container.innerHTML = '<p class="empty-message">Sin tareas pendientes.</p>';
            return;
        }

        container.innerHTML = tareas.map(t => `
            <div class="item-card tarea-card ${t.completada ? 'completada' : ''}">
                <div class="item-header">
                    <h3>
                        <input type="checkbox" ${t.completada ? 'checked' : ''} 
                               onchange="toggleTarea(${t.id}, ${!t.completada})">
                        ${t.titulo.toUpperCase()}
                    </h3>
                    <button class="btn-delete" onclick="eliminarTarea(${t.id})">🗑️</button>
                </div>
                <p>${(t.descripcion || '').toUpperCase()}</p>
                <div class="tarea-footer">
                    <span class="prioridad-${t.prioridad}">
                        ${t.prioridad === 'baja' ? ' BAJA' : t.prioridad === 'media' ? 'MEDIA' : 'ALTA'}
                    </span>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function toggleTarea(id, nuevoEstado) {
    const token = getToken();
    // Enviamos el nuevo estado con Token
    await fetch(`${API_URL}/tareas/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completada: nuevoEstado })
    });
    cargarTareas();
}

async function eliminarTarea(id) {
    if (confirm('¿Eliminar tarea?')) {
        const token = getToken();
        await fetch(`${API_URL}/tareas/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        cargarTareas();
    }
}

// --- GESTIÓN DE EVENTOS ---

async function agregarEvento() {
    const nombre = document.getElementById('eventoNombre').value.trim();
    const fecha = document.getElementById('eventoFecha').value;
    const lugar = document.getElementById('eventoLugar').value.trim();

    if (!nombre || !fecha) return alert('Datos incompletos');

    const token = getToken();

    await fetch(`${API_URL}/eventos`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, fecha, lugar })
    });

    document.getElementById('eventoNombre').value = '';
    document.getElementById('eventoFecha').value = '';
    document.getElementById('eventoLugar').value = '';
    cargarEventos();
}

async function cargarEventos() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        const eventos = await response.json();
        const container = document.getElementById('eventosContainer');

        if (eventos.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay eventos.</p>';
            return;
        }

        container.innerHTML = eventos.map(e => `
            <div class="item-card evento-card">
                <div class="item-header">
                    <h3>📅 ${e.nombre.toUpperCase()}</h3>
                    <button class="btn-delete" onclick="eliminarEvento(${e.id})">🗑️</button>
                </div>
                <p><strong>FECHA:</strong> ${new Date(e.fecha).toLocaleDateString()}</p>
                <p><strong>LUGAR:</strong> ${(e.lugar || '---').toUpperCase()}</p>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function eliminarEvento(id) {
    if (confirm('¿Eliminar evento?')) {
        const token = getToken();
        await fetch(`${API_URL}/eventos/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        cargarEventos();
    }
}
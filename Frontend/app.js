// ============ MANEJO DE LOGIN Y REGISTRO ============

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerLink = document.getElementById('registerLink');
const loginLink = document.getElementById('loginLink');
const loginCard = document.querySelector('.login-card');
const registerCard = document.getElementById('registerCard');
const errorMessage = document.getElementById('errorMessage');
const registerErrorMessage = document.getElementById('registerErrorMessage');

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

// Manejar login
loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username.trim() === '' || password.trim() === '') {
        errorMessage.textContent = 'Completa todos los campos';
        errorMessage.style.display = 'block';
        return;
    }

    // Guardar sesión en localStorage
    localStorage.setItem('currentUser', username);
    localStorage.setItem('userPassword', password);
    
    // Ir a página principal
    window.location.href = 'Pagina_principal.html';
});

// Manejar registro
registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;

    if (username.trim() === '' || password.trim() === '') {
        registerErrorMessage.textContent = 'Usuario y contraseña son obligatorios';
        registerErrorMessage.style.display = 'block';
        return;
    }

    // Guardar usuario en localStorage
    localStorage.setItem('currentUser', username);
    localStorage.setItem('userPassword', password);
    if (email) localStorage.setItem('userEmail', email);

    // Ir a página principal
    window.location.href = 'Pagina_principal.html';
});

// ============ MANEJO DE PÁGINA PRINCIPAL ============

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario está autenticado
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

document.getElementById('logoutBtn')?.addEventListener('click', logoutUsuario);

// Cambio de secciones
function inicializarPaginaPrincipal() {
    const menuBtns = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.section');

    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover clase activa de botones y secciones
            menuBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Añadir clase activa
            btn.classList.add('active');
            const sectionId = btn.getAttribute('data-section') + 'Section';
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Cargar datos al iniciar
    cargarAnimales();
    cargarUsuarios();
    cargarTareas();
    cargarEventos();
}

// ============ GESTIÓN DE CANCIONES ============

function agregarCancion() {
    const titulo = document.getElementById('cancionTitulo').value.trim();
    const artista = document.getElementById('cancionArtista').value.trim();
    const genero = document.getElementById('cancionGenero').value.trim();

    if (!titulo || !artista) {
        alert('⚠️ Por favor completa el título y artista');
        return;
    }

    const canciones = JSON.parse(localStorage.getItem('canciones') || '[]');
    const nuevaCancion = {
        id: Date.now(),
        titulo,
        artista,
        genero,
        fechaAgregada: new Date().toLocaleDateString()
    };

    canciones.push(nuevaCancion);
    localStorage.setItem('canciones', JSON.stringify(canciones));

    // Limpiar inputs
    document.getElementById('cancionTitulo').value = '';
    document.getElementById('cancionArtista').value = '';
    document.getElementById('cancionGenero').value = '';

    cargarAnimales();
}

function cargarAnimales() {
    const canciones = JSON.parse(localStorage.getItem('canciones') || '[]');
    const container = document.getElementById('cancionesContainer');

    if (canciones.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay canciones guardadas. ¡Añade una!</p>';
        return;
    }

    container.innerHTML = canciones.map(cancion => `
        <div class="item-card cancion-card">
            <div class="item-header">
                <h3>🎵 ${cancion.titulo.toUpperCase()}</h3>
                <button class="btn-delete" onclick="eliminarCancion(${cancion.id})">🗑️</button>
            </div>
            <p><strong>ARTISTA:</strong> ${cancion.artista.toUpperCase()}</p>
            <p><strong>GÉNERO:</strong> ${(cancion.genero || 'NO ESPECIFICADO').toUpperCase()}</p>
            <small>Agregado: ${cancion.fechaAgregada}</small>
        </div>
    `).join('');
}

function eliminarCancion(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
        let canciones = JSON.parse(localStorage.getItem('canciones') || '[]');
        canciones = canciones.filter(c => c.id !== id);
        localStorage.setItem('canciones', JSON.stringify(canciones));
        cargarAnimales();
    }
}

// ============ GESTIÓN DE USUARIOS ============

function agregarUsuario() {
    const nombre = document.getElementById('usuarioNombre').value.trim();
    const email = document.getElementById('usuarioEmail').value.trim();
    const pais = document.getElementById('usuarioPais').value.trim();

    if (!nombre) {
        alert('Por favor ingresa el nombre del fan');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const nuevoUsuario = {
        id: Date.now(),
        nombre,
        email,
        pais,
        fechaRegistro: new Date().toLocaleDateString()
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Limpiar inputs
    document.getElementById('usuarioNombre').value = '';
    document.getElementById('usuarioEmail').value = '';
    document.getElementById('usuarioPais').value = '';

    cargarUsuarios();
}

function cargarUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const container = document.getElementById('usuariosContainer');

    if (usuarios.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay fans registrados. ¡Sé el primero!</p>';
        return;
    }

    container.innerHTML = usuarios.map(usuario => `
        <div class="item-card usuario-card">
            <div class="item-header">
                <h3>👥 ${usuario.nombre.toUpperCase()}</h3>
                <button class="btn-delete" onclick="eliminarUsuario(${usuario.id})">🗑️</button>
            </div>
            <p><strong>EMAIL:</strong> ${usuario.email || 'NO PROPORCIONADO'}</p>
            <p><strong>UBICACIÓN:</strong> ${(usuario.pais || 'NO ESPECIFICADA').toUpperCase()}</p>
            <small>Registrado: ${usuario.fechaRegistro}</small>
        </div>
    `).join('');
}

function eliminarUsuario(id) {
    if (confirm('¿Eliminar este fan?')) {
        let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        usuarios = usuarios.filter(u => u.id !== id);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        cargarUsuarios();
    }
}

// ============ GESTIÓN DE TAREAS ============

function agregarTarea() {
    const titulo = document.getElementById('tareaTitulo').value.trim();
    const descripcion = document.getElementById('tareaDescripcion').value.trim();
    const prioridad = document.getElementById('tareaPrioridad').value;

    if (!titulo) {
        alert('⚠️ Por favor ingresa el título de la tarea');
        return;
    }

    const tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    const nuevaTarea = {
        id: Date.now(),
        titulo,
        descripcion,
        prioridad,
        completada: false,
        fechaCreacion: new Date().toLocaleDateString()
    };

    tareas.push(nuevaTarea);
    localStorage.setItem('tareas', JSON.stringify(tareas));

    // Limpiar inputs
    document.getElementById('tareaTitulo').value = '';
    document.getElementById('tareaDescripcion').value = '';
    document.getElementById('tareaPrioridad').value = 'baja';

    cargarTareas();
}

function cargarTareas() {
    const tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    const container = document.getElementById('tareasContainer');

    if (tareas.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay tareas. ¡Añade una para no olvidar nada!</p>';
        return;
    }

    container.innerHTML = tareas.map(tarea => `
        <div class="item-card tarea-card ${tarea.completada ? 'completada' : ''}">
            <div class="item-header">
                <h3>
                    <input type="checkbox" ${tarea.completada ? 'checked' : ''} 
                           onchange="toggleTarea(${tarea.id})">
                    ${tarea.titulo.toUpperCase()}
                </h3>
                <button class="btn-delete" onclick="eliminarTarea(${tarea.id})">🗑️</button>
            </div>
            <p>${(tarea.descripcion || 'SIN DESCRIPCIÓN').toUpperCase()}</p>
            <div class="tarea-footer">
                <span class="prioridad-${tarea.prioridad}">
                    ${tarea.prioridad === 'baja' ? '🟢 BAJA' : tarea.prioridad === 'media' ? '🟡 MEDIA' : '🔴 ALTA'}
                </span>
                <small>Creada: ${tarea.fechaCreacion}</small>
            </div>
        </div>
    `).join('');
}

function toggleTarea(id) {
    let tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = !tarea.completada;
        localStorage.setItem('tareas', JSON.stringify(tareas));
        cargarTareas();
    }
}

function eliminarTarea(id) {
    if (confirm('¿Eliminar esta tarea?')) {
        let tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
        tareas = tareas.filter(t => t.id !== id);
        localStorage.setItem('tareas', JSON.stringify(tareas));
        cargarTareas();
    }
}

// ============ GESTIÓN DE EVENTOS ============

function agregarEvento() {
    const nombre = document.getElementById('eventoNombre').value.trim();
    const fecha = document.getElementById('eventoFecha').value;
    const lugar = document.getElementById('eventoLugar').value.trim();

    if (!nombre || !fecha) {
        alert('Por favor completa el nombre y la fecha del evento');
        return;
    }

    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    const nuevoEvento = {
        id: Date.now(),
        nombre,
        fecha,
        lugar,
        fechaCreacion: new Date().toLocaleDateString()
    };

    eventos.push(nuevoEvento);
    localStorage.setItem('eventos', JSON.stringify(eventos));

    // Limpiar inputs
    document.getElementById('eventoNombre').value = '';
    document.getElementById('eventoFecha').value = '';
    document.getElementById('eventoLugar').value = '';

    cargarEventos();
}

function cargarEventos() {
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    const container = document.getElementById('eventosContainer');

    if (eventos.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay eventos próximos. ¡Mantente atento!</p>';
        return;
    }

    container.innerHTML = eventos.map(evento => `
        <div class="item-card evento-card">
            <div class="item-header">
                <h3>📅 ${evento.nombre.toUpperCase()}</h3>
                <button class="btn-delete" onclick="eliminarEvento(${evento.id})">🗑️</button>
            </div>
            <p><strong>FECHA:</strong> ${evento.fecha}</p>
            <p><strong>LUGAR:</strong> ${(evento.lugar || 'POR CONFIRMAR').toUpperCase()}</p>
            <small>Publicado: ${evento.fechaCreacion}</small>
        </div>
    `).join('');
}

function eliminarEvento(id) {
    if (confirm('¿Eliminar este evento?')) {
        let eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
        eventos = eventos.filter(e => e.id !== id);
        localStorage.setItem('eventos', JSON.stringify(eventos));
        cargarEventos();
    }
}
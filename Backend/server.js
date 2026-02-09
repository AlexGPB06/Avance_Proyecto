const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

const app = express();

// --- MIDDLEWARES GLOBALES ---
app.use(cors()); // Permitir conexión desde el Frontend
app.use(express.json()); // Permitir leer JSON en las peticiones

// --- CONEXIÓN A BASE DE DATOS ---
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado a la Base de Datos MySQL');
});

// --- MIDDLEWARE DE SEGURIDAD (JWT) ---
// Este middleware protege las rutas privadas
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado: Se requiere Token' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_para_tokens', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }
        req.user = user;
        next(); // Token válido, continuamos
    });
};

// --- RUTAS DE AUTENTICACIÓN (Públicas) ---

// 1. REGISTRO
app.post('/api/register', async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
        
        db.execute(query, [username, hashedPassword, email], (err, result) => {
            if (err) {
                if (err.errno === 1062) return res.status(400).json({ message: 'El usuario ya existe' });
                return next(err); 
            }
            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        });
    } catch (error) {
        next(error);
    }
});

// 2. LOGIN
app.post('/api/login', (req, res, next) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.execute(query, [username], async (err, results) => {
        if (err) return next(err);
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            process.env.JWT_SECRET || 'clave_secreta_para_tokens', 
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login exitoso', token, username: user.username });
    });
});

// --- RUTAS CRUD (Protegidas parcialmente) ---

// 1. CANCIONES
app.get('/api/canciones', (req, res, next) => { // Pública (Lectura)
    db.execute('SELECT * FROM canciones ORDER BY id DESC', (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

app.post('/api/canciones', verificarToken, (req, res, next) => { 
    const { titulo, artista, genero } = req.body;
    const query = 'INSERT INTO canciones (titulo, artista, genero) VALUES (?, ?, ?)';
    db.execute(query, [titulo, artista, genero], (err, result) => {
        if (err) return next(err);
        res.status(201).json({ id: result.insertId, message: 'Canción agregada' });
    });
});

app.delete('/api/canciones/:id', verificarToken, (req, res, next) => { // Protegida (Borrado)
    db.execute('DELETE FROM canciones WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Eliminado' });
    });
});

// 2. FANS
app.get('/api/fans', (req, res, next) => {
    db.execute('SELECT * FROM fans ORDER BY id DESC', (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

app.post('/api/fans', verificarToken, (req, res, next) => {
    const { nombre, email, pais } = req.body;
    const query = 'INSERT INTO fans (nombre, email, pais) VALUES (?, ?, ?)';
    db.execute(query, [nombre, email, pais], (err, result) => {
        if (err) return next(err);
        res.status(201).json({ id: result.insertId, message: 'Fan registrado' });
    });
});

app.delete('/api/fans/:id', verificarToken, (req, res, next) => {
    db.execute('DELETE FROM fans WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Eliminado' });
    });
});

// 3. TAREAS
app.get('/api/tareas', (req, res, next) => {
    db.execute('SELECT * FROM tareas ORDER BY id DESC', (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

app.post('/api/tareas', verificarToken, (req, res, next) => {
    const { titulo, descripcion, prioridad } = req.body;
    const query = 'INSERT INTO tareas (titulo, descripcion, prioridad) VALUES (?, ?, ?)';
    db.execute(query, [titulo, descripcion, prioridad], (err, result) => {
        if (err) return next(err);
        res.status(201).json({ id: result.insertId, message: 'Tarea creada' });
    });
});

app.put('/api/tareas/:id', verificarToken, (req, res, next) => {
    const { completada } = req.body; 
    db.execute('UPDATE tareas SET completada = ? WHERE id = ?', [completada, req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Estado actualizado' });
    });
});

app.delete('/api/tareas/:id', verificarToken, (req, res, next) => {
    db.execute('DELETE FROM tareas WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Eliminado' });
    });
});

// 4. EVENTOS
app.get('/api/eventos', (req, res, next) => {
    db.execute('SELECT * FROM eventos ORDER BY fecha ASC', (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

app.post('/api/eventos', verificarToken, (req, res, next) => {
    const { nombre, fecha, lugar } = req.body;
    const query = 'INSERT INTO eventos (nombre, fecha, lugar) VALUES (?, ?, ?)';
    db.execute(query, [nombre, fecha, lugar], (err, result) => {
        if (err) return next(err);
        res.status(201).json({ id: result.insertId, message: 'Evento creado' });
    });
});

app.delete('/api/eventos/:id', verificarToken, (req, res, next) => {
    db.execute('DELETE FROM eventos WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Eliminado' });
    });
});

// --- MIDDLEWARE GLOBAL DE MANEJO DE ERRORES ---
// Este middleware captura cualquier error (next(err)) y responde al cliente
app.use((err, req, res, next) => {
    console.error('[Error del Servidor]:', err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Ocurrió un error interno en el servidor.',
        detail: err.message // Puedes quitar esto en producción
    });
});

//  INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});
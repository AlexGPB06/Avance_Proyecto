/* =========================================
   SERVER.JS - Backend Completo
   ========================================= */
require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// --- MIDDLEWARES ---
app.use(cors()); // Permitir conexión desde el Frontend
app.use(express.json()); // Permitir leer JSON en las peticiones

// --- CONEXIÓN A BASE DE DATOS ---
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || "Masterchief177#",
    database: process.env.DB_NAME || 'avance_proyecto'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err);
        return;
    }
    console.log('✅ Conectado a la Base de Datos MySQL');
});

// ==================================================
// RUTAS DE AUTENTICACIÓN (LOGIN / REGISTER)
// ==================================================

// 1. REGISTRO DE USUARIO
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        // Validar datos
        if (!username || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guardar en BD
        const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
        db.execute(query, [username, hashedPassword, email], (err, result) => {
            if (err) {
                // Error 1062 es "Duplicado" (Usuario ya existe)
                if (err.errno === 1062) return res.status(400).json({ message: 'El usuario ya existe' });
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// 2. INICIO DE SESIÓN (LOGIN)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.execute(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Si no encuentra al usuario
        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = results[0];

        // Comparar contraseñas
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Generar Token (JWT)
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            process.env.JWT_SECRET || 'secreto_super_seguro', 
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login exitoso', token, username: user.username });
    });
});

// ==================================================
// RUTAS DE LA APLICACIÓN (CRUD)
// ==================================================

// --- 1. CANCIONES ---
app.get('/api/canciones', (req, res) => {
    db.execute('SELECT * FROM canciones ORDER BY id DESC', (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post('/api/canciones', (req, res) => {
    const { titulo, artista, genero } = req.body;
    const query = 'INSERT INTO canciones (titulo, artista, genero) VALUES (?, ?, ?)';
    db.execute(query, [titulo, artista, genero], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, message: 'Canción agregada' });
    });
});

app.delete('/api/canciones/:id', (req, res) => {
    db.execute('DELETE FROM canciones WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Eliminado' });
    });
});

// --- 2. FANS (USUARIOS COMUNIDAD) ---
app.get('/api/fans', (req, res) => {
    db.execute('SELECT * FROM fans ORDER BY id DESC', (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post('/api/fans', (req, res) => {
    const { nombre, email, pais } = req.body;
    const query = 'INSERT INTO fans (nombre, email, pais) VALUES (?, ?, ?)';
    db.execute(query, [nombre, email, pais], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, message: 'Fan registrado' });
    });
});

app.delete('/api/fans/:id', (req, res) => {
    db.execute('DELETE FROM fans WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Eliminado' });
    });
});

// --- 3. TAREAS ---
app.get('/api/tareas', (req, res) => {
    db.execute('SELECT * FROM tareas ORDER BY id DESC', (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post('/api/tareas', (req, res) => {
    const { titulo, descripcion, prioridad } = req.body;
    const query = 'INSERT INTO tareas (titulo, descripcion, prioridad) VALUES (?, ?, ?)';
    db.execute(query, [titulo, descripcion, prioridad], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, message: 'Tarea creada' });
    });
});

app.put('/api/tareas/:id', (req, res) => {
    const { completada } = req.body; 
    db.execute('UPDATE tareas SET completada = ? WHERE id = ?', [completada, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Estado actualizado' });
    });
});

app.delete('/api/tareas/:id', (req, res) => {
    db.execute('DELETE FROM tareas WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Eliminado' });
    });
});

// --- 4. EVENTOS ---
app.get('/api/eventos', (req, res) => {
    db.execute('SELECT * FROM eventos ORDER BY fecha ASC', (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post('/api/eventos', (req, res) => {
    const { nombre, fecha, lugar } = req.body;
    const query = 'INSERT INTO eventos (nombre, fecha, lugar) VALUES (?, ?, ?)';
    db.execute(query, [nombre, fecha, lugar], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, message: 'Evento creado' });
    });
});

app.delete('/api/eventos/:id', (req, res) => {
    db.execute('DELETE FROM eventos WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Eliminado' });
    });
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
});
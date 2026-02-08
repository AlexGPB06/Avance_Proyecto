// backend/server.js
require('dotenv').config(); // <--- Esto busca el archivo .env en la misma carpeta
// ... resto de imports
// Ejemplo de uso:
const PORT = process.env.PORT || 3000;
const path = require('path');
// __dirname le dice a node: "busca en la carpeta donde vive este archivo"
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Para encriptar contraseñas
const jwt = require('jsonwebtoken'); // Para crear tokens
require('dotenv').config(); // Para leer el archivo .env

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Vital para leer req.body

// Conexión a BD (Usando variables de entorno por seguridad)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // <--- CAMBIA ESTO (Agrega WORD al final)
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) console.error('Error BD:', err);
    else console.log('Conectado a MySQL: avance_proyecto');
});

// --- RUTAS DE AUTENTICACIÓN (Requerido por tu actividad) ---

// 1. Registro de Usuario
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    // Encriptamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.execute(query, [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: 'Usuario registrado' });
    });
});

// 2. Login (Devuelve JWT)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.execute('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });
        
        const user = results[0];
        // Comparamos contraseña
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(401).json({ error: 'Contraseña incorrecta' });

        // Creamos el Token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, message: 'Login exitoso' });
    });
});

// --- RUTAS CRUD (Basado en tu archivo server.js subido) ---

app.get('/api/tasks', (req, res) => {
    // Aquí podrías validar el token si quisieras proteger la ruta
    db.execute('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/tasks', (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Falta el título' });

    const query = 'INSERT INTO tasks (title, description) VALUES (?, ?)';
    db.execute(query, [title, description], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: 'Tarea creada', id: result.insertId });
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${process.env.PORT}`);
});
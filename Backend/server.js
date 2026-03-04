const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// --- MIDDLEWARES GLOBALES ---
app.use(cors());
app.use(express.json());

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

// --- MIDDLEWARES DE SEGURIDAD (JWT Y ROLES) ---
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado: Se requiere Token' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_para_tokens', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
};

const verificarAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado: Privilegios de administrador requeridos' });
    }
    next();
};

// --- RUTAS DE AUTENTICACIÓN ---
// REGISTRO DE USUARIOS CON NUEVOS CAMPOS Y VALIDACIÓN ÚNICA
app.post('/api/register', async (req, res, next) => {
    const { username, email, password, fecha_nacimiento, sexo } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.execute(
            'INSERT INTO users (username, email, password, rol, fecha_nacimiento, sexo) VALUES (?, ?, ?, "fan", ?, ?)',
            [username, email, hashedPassword, fecha_nacimiento, sexo || 'Prefiero no decirlo'],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        if (err.sqlMessage.includes('username')) {
                            return res.status(400).json({ message: '🚨 Este nombre de usuario ya está ocupado. Elige otro.' });
                        }
                        if (err.sqlMessage.includes('email')) {
                            return res.status(400).json({ message: '🚨 Este correo electrónico ya está registrado.' });
                        }
                    }
                    return next(err); 
                }
                res.status(201).json({ message: '¡Cuenta creada exitosamente!' });
            }
        );
    } catch (error) {
        next(error);
    }
});

app.post('/api/login', (req, res, next) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    db.execute(query, [username], async (err, results) => {
        if (err) return next(err);
        if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign(
            { id: user.id, username: user.username, rol: user.rol }, 
            process.env.JWT_SECRET || 'clave_secreta_para_tokens', 
            { expiresIn: '2h' }
        );
        res.json({ message: 'Login exitoso', token, username: user.username, rol: user.rol });
    });
});

// --- RUTAS CRUD (Lectura, Creación, Borrado y ACTUALIZACIÓN) ---

// 1. CANCIONES
app.get('/api/canciones', (req, res, next) => {
    let limitValue = parseInt(req.query.limit) || 50; 
    let pageValue = parseInt(req.query.page) || 1;
    let offsetValue = (pageValue - 1) * limitValue;
    let genero = req.query.genero;

    let query = 'SELECT * FROM canciones';
    let queryParams = [];

    if (genero) {
        query += ' WHERE genero = ?';
        queryParams.push(genero);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    queryParams.push(limitValue.toString(), offsetValue.toString());

    db.execute(query, queryParams, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

app.get('/api/canciones/:id', (req, res, next) => { 
    db.execute('SELECT * FROM canciones WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) return res.status(404).json({ message: 'Canción no encontrada' });
        res.json(rows[0]);
    });
});

app.post('/api/canciones', verificarToken, verificarAdmin, (req, res, next) => { 
    const { titulo, artista, genero } = req.body;
    db.execute('INSERT INTO canciones (titulo, artista, genero) VALUES (?, ?, ?)', [titulo, artista, genero], (err, result) => {
        if (err) return next(err);
        res.status(201).json({ id: result.insertId, message: 'Canción agregada' });
    });
});

app.put('/api/canciones/:id', verificarToken, verificarAdmin, (req, res, next) => { 
    const { titulo, artista, genero } = req.body;
    db.execute('UPDATE canciones SET titulo = ?, artista = ?, genero = ? WHERE id = ?', [titulo, artista, genero, req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Canción actualizada' });
    });
});

app.delete('/api/canciones/:id', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('DELETE FROM canciones WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Eliminado' });
    });
});

// 2. FORO DE DISCUSIÓN 
app.get('/api/foros', verificarToken, (req, res, next) => {
    let query = `
        SELECT f.*, u.username as autor 
        FROM foros f 
        JOIN users u ON f.user_id = u.id
    `;
    
    if (req.user.rol !== 'admin') {
        query += ' WHERE f.estado = "aprobado"';
    }
    query += ' ORDER BY f.fecha_creacion DESC';

    db.execute(query, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

app.post('/api/foros', verificarToken, (req, res, next) => {
    const { titulo, descripcion } = req.body; 
    const user_id = req.user.id;

    db.execute('INSERT INTO foros (titulo, descripcion, user_id, estado) VALUES (?, ?, ?, "pendiente")', 
    [titulo, descripcion, user_id], (err, result) => {
        if (err) return next(err);
        res.status(201).json({ message: 'Tema propuesto exitosamente. Esperando aprobación del Admin.' });
    });
});

app.put('/api/foros/:id/estado', verificarToken, verificarAdmin, (req, res, next) => {
    const { estado } = req.body; 
    db.execute('UPDATE foros SET estado = ? WHERE id = ?', [estado, req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: `El tema ha sido ${estado}` });
    });
});

app.delete('/api/foros/:id', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('DELETE FROM foros WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Tema eliminado del foro' });
    });
});

// 3. TAREAS (Álbumes)
app.get('/api/tareas', (req, res, next) => {
    db.execute('SELECT * FROM tareas ORDER BY id DESC', (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});
app.get('/api/tareas/:id', (req, res, next) => {
    db.execute('SELECT * FROM tareas WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
        res.json(rows[0]);
    });
});
app.post('/api/tareas', verificarToken, verificarAdmin, (req, res, next) => {
    const { titulo, descripcion, prioridad } = req.body;
    db.execute('INSERT INTO tareas (titulo, descripcion, prioridad) VALUES (?, ?, ?)', [titulo, descripcion, prioridad], (err, result) => {
        if (err) return next(err);
        res.status(201).json({ id: result.insertId, message: 'Tarea creada' });
    });
});
app.put('/api/tareas/:id', verificarToken, verificarAdmin, (req, res, next) => { 
    const { completada } = req.body; 
    db.execute('UPDATE tareas SET completada = ? WHERE id = ?', [completada, req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Estado actualizado' });
    });
});
app.put('/api/tareas/editar/:id', verificarToken, verificarAdmin, (req, res, next) => { 
    const { titulo, descripcion, prioridad } = req.body;
    db.execute('UPDATE tareas SET titulo = ?, descripcion = ?, prioridad = ? WHERE id = ?', [titulo, descripcion, prioridad, req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Tarea actualizada' });
    });
});
app.delete('/api/tareas/:id', verificarToken, verificarAdmin, (req, res, next) => {
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
app.get('/api/eventos/:id', (req, res, next) => {
    db.execute('SELECT * FROM eventos WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) return res.status(404).json({ message: 'Evento no encontrado' });
        res.json(rows[0]);
    });
});
app.post('/api/eventos', verificarToken, verificarAdmin, (req, res, next) => {
    const { nombre, fecha, lugar } = req.body;
    db.execute('INSERT INTO eventos (nombre, fecha, lugar) VALUES (?, ?, ?)', [nombre, fecha, lugar], (err, result) => {
        if (err) return next(err);
        res.status(201).json({ id: result.insertId, message: 'Evento creado' });
    });
});
app.put('/api/eventos/:id', verificarToken, verificarAdmin, (req, res, next) => { 
    const { nombre, fecha, lugar } = req.body;
    db.execute('UPDATE eventos SET nombre = ?, fecha = ?, lugar = ? WHERE id = ?', [nombre, fecha, lugar, req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Evento actualizado' });
    });
});
app.delete('/api/eventos/:id', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('DELETE FROM eventos WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Eliminado' });
    });
});

// --- RUTAS DE INTERACCIÓN (Comentarios y Calificaciones) ---

app.get('/api/comentarios/:tipo/:id', (req, res, next) => {
    const query = `
        SELECT c.*, u.username 
        FROM comentarios c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.tipo_entidad = ? AND c.entidad_id = ?
        ORDER BY c.fecha_creacion DESC
    `;
    db.execute(query, [req.params.tipo, req.params.id], (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

app.post('/api/comentarios', verificarToken, (req, res, next) => {
    const { entidad_id, tipo_entidad, comentario } = req.body;
    const user_id = req.user.id; 

    db.execute(
        'INSERT INTO comentarios (user_id, entidad_id, tipo_entidad, comentario) VALUES (?, ?, ?, ?)',
        [user_id, entidad_id, tipo_entidad, comentario],
        (err, result) => {
            if (err) return next(err);
            res.status(201).json({ message: 'Comentario publicado' });
        }
    );
});

// NUEVO: Editar un comentario (Solo el autor)
app.put('/api/comentarios/:id', verificarToken, (req, res, next) => {
    const { comentario } = req.body;
    const userId = req.user.id;
    db.execute('UPDATE comentarios SET comentario = ? WHERE id = ? AND user_id = ?', 
    [comentario, req.params.id, userId], (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) return res.status(403).json({ message: 'No puedes editar un comentario que no es tuyo' });
        res.json({ message: 'Comentario actualizado' });
    });
});

// NUEVO: Eliminar un comentario (El autor o el Admin)
app.delete('/api/comentarios/:id', verificarToken, (req, res, next) => {
    const userId = req.user.id;
    const userRol = req.user.rol;
    
    let query = 'DELETE FROM comentarios WHERE id = ?';
    let params = [req.params.id];

    if (userRol !== 'admin') {
        query += ' AND user_id = ?';
        params.push(userId);
    }

    db.execute(query, params, (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) return res.status(403).json({ message: 'No tienes permisos para borrar este comentario' });
        res.json({ message: 'Comentario eliminado' });
    });
});

app.get('/api/calificaciones/:tipo/:id', (req, res, next) => {
    const query = 'SELECT AVG(puntuacion) as promedio, COUNT(id) as total FROM calificaciones WHERE tipo_entidad = ? AND entidad_id = ?';
    db.execute(query, [req.params.tipo, req.params.id], (err, rows) => {
        if (err) return next(err);
        res.json(rows[0]);
    });
});

app.post('/api/calificaciones', verificarToken, (req, res, next) => {
    const { entidad_id, tipo_entidad, puntuacion } = req.body;
    const user_id = req.user.id;

    const query = `
        INSERT INTO calificaciones (user_id, entidad_id, tipo_entidad, puntuacion) 
        VALUES (?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE puntuacion = VALUES(puntuacion)
    `;
    db.execute(query, [user_id, entidad_id, tipo_entidad, puntuacion], (err) => {
        if (err) return next(err);
        res.json({ message: 'Calificación guardada' });
    });
});

// --- RUTAS DE MI PERFIL ---

app.get('/api/perfil', verificarToken, (req, res, next) => {
    const userId = req.user.id;
    
    db.execute('SELECT username, email, rol, descripcion, fecha_registro FROM users WHERE id = ?', [userId], (err, userRows) => {
        if (err) return next(err);
        if (userRows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        
        const userData = userRows[0];

        db.execute('SELECT * FROM foros WHERE user_id = ? ORDER BY fecha_creacion DESC', [userId], (err, forosRows) => {
            if (err) return next(err);
            
            const queryFavoritos = `
                SELECT c.id, c.titulo, c.artista as subtitulo, cal.puntuacion, 'cancion' as tipo 
                FROM canciones c 
                JOIN calificaciones cal ON c.id = cal.entidad_id AND cal.tipo_entidad = 'cancion' 
                WHERE cal.user_id = ? AND cal.puntuacion >= 4
                UNION
                SELECT t.id, t.titulo, t.descripcion as subtitulo, cal.puntuacion, 'tarea' as tipo 
                FROM tareas t 
                JOIN calificaciones cal ON t.id = cal.entidad_id AND cal.tipo_entidad = 'tarea' 
                WHERE cal.user_id = ? AND cal.puntuacion >= 4
                ORDER BY puntuacion DESC
            `;
            
            db.execute(queryFavoritos, [userId, userId], (err, favoritosRows) => {
                if (err) return next(err);
                
                res.json({
                    usuario: userData,
                    foros: forosRows,
                    favoritos: favoritosRows
                });
            });
        });
    });
});

app.put('/api/perfil/descripcion', verificarToken, (req, res, next) => {
    const { descripcion } = req.body;
    db.execute('UPDATE users SET descripcion = ? WHERE id = ?', [descripcion, req.user.id], (err) => {
        if (err) return next(err);
        res.json({ message: 'Descripción actualizada correctamente' });
    });
});

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error('[Error Servidor]:', err.stack);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
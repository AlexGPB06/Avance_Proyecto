const path = require('path');
const fs = require('fs');
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
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) { 
        console.error('Error conectando a MySQL:', err); 
    }
    else {
        console.log('Conectado a la Base de Datos MySQL (Pool)');
        connection.release();
    }
});

// --- MIDDLEWARES DE SEGURIDAD ---
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

// ==========================================
//           RUTAS DE LA APLICACIÓN
// ==========================================

// --- AUTENTICACIÓN ---
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
                            return res.status(400).json({ message: '🚨 Nombre de usuario ocupado.' });
                        }
                        if (err.sqlMessage.includes('email')) {
                            return res.status(400).json({ message: '🚨 Correo ya registrado.' });
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
    
    db.execute('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
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
            { id: user.id, username: user.username, rol: user.rol }, 
            process.env.JWT_SECRET || 'clave_secreta_para_tokens', 
            { expiresIn: '12h' }
        );
        
        res.json({ message: 'Login exitoso', token, username: user.username, rol: user.rol });
    });
});

// --- PANTALLA DE INICIO (HOME) ---
app.get('/api/banners', verificarToken, (req, res, next) => {
    db.execute('SELECT * FROM banners', (err, rows) => {
        if (err) return next(err); 
        res.json(rows);
    });
});

app.put('/api/banners/:posicion', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('UPDATE banners SET imagen_url = ? WHERE posicion = ?', [req.body.imagen_url, req.params.posicion], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Banner actualizado' });
    });
});

app.get('/api/inicio/destacados', verificarToken, (req, res, next) => {
    db.execute('SELECT * FROM destacados_home', (err, slotsRows) => {
        if (err) return next(err);
        
        db.execute('SELECT id, titulo, artista, genero FROM canciones ORDER BY id DESC', (err, cancionesRows) => {
            if (err) return next(err);
            
            db.execute('SELECT id, titulo, descripcion FROM tareas ORDER BY id DESC', (err, albumesRows) => {
                if (err) return next(err);
                
                res.json({ slots: slotsRows, canciones: cancionesRows, albumes: albumesRows });
            });
        });
    });
});

app.put('/api/inicio/destacados', verificarToken, verificarAdmin, (req, res, next) => {
    const { slot, item_id } = req.body;
    db.execute('UPDATE destacados_home SET item_id = ? WHERE slot = ?', [item_id || null, slot], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Destacado actualizado' });
    });
});

app.get('/api/encuestas/activa', verificarToken, (req, res, next) => {
    db.execute('SELECT * FROM encuestas WHERE activa = TRUE ORDER BY id DESC LIMIT 1', (err, encuestas) => {
        if (err) return next(err);
        if (encuestas.length === 0) return res.json(null);
        
        const encuesta = encuestas[0];
        
        db.execute('SELECT opcion_seleccionada, COUNT(*) as total FROM encuesta_votos WHERE encuesta_id = ? GROUP BY opcion_seleccionada', [encuesta.id], (err, votos) => {
            if (err) return next(err);
            
            db.execute('SELECT opcion_seleccionada FROM encuesta_votos WHERE encuesta_id = ? AND user_id = ?', [encuesta.id, req.user.id], (err, miVoto) => {
                if (err) return next(err);
                
                res.json({ 
                    encuesta, 
                    conteos: votos, 
                    yaVote: miVoto.length > 0 ? miVoto[0].opcion_seleccionada : null 
                });
            });
        });
    });
});

app.post('/api/encuestas', verificarToken, verificarAdmin, (req, res, next) => {
    const { pregunta, opcion1, opcion2, opcion3, opcion4 } = req.body;
    
    db.execute('UPDATE encuestas SET activa = FALSE', (err) => {
        if (err) return next(err);
        
        db.execute(
            'INSERT INTO encuestas (pregunta, opcion1, opcion2, opcion3, opcion4) VALUES (?, ?, ?, ?, ?)', 
            [pregunta, opcion1, opcion2, opcion3 || null, opcion4 || null], 
            (err) => {
                if (err) return next(err); 
                res.status(201).json({ message: 'Encuesta publicada' });
            }
        );
    });
});

app.delete('/api/encuestas/:id', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('DELETE FROM encuestas WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Encuesta eliminada' });
    });
});

app.post('/api/encuestas/:id/votar', verificarToken, (req, res, next) => {
    db.execute(
        'INSERT INTO encuesta_votos (encuesta_id, user_id, opcion_seleccionada) VALUES (?, ?, ?)', 
        [req.params.id, req.user.id, req.body.opcion], 
        (err) => {
            if (err && err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Ya votaste en esta encuesta.' });
            }
            if (err) return next(err); 
            
            res.json({ message: 'Voto registrado exitosamente' });
        }
    );
});

// --- AVISOS GLOBALES (INICIO Y NOTIFICACIONES) ---
app.post('/api/notificaciones/aviso', verificarToken, verificarAdmin, (req, res, next) => {
    const mensaje = req.body.mensaje;
    const autor = req.user.username;

    db.execute('INSERT INTO avisos_globales (mensaje, autor) VALUES (?, ?)', [mensaje, autor], (err) => {
        if (err) return next(err);
        
        db.execute('SELECT id FROM users WHERE rol = "fan"', (err, rows) => {
            if (err) return next(err);
            if (rows.length === 0) {
                return res.json({ message: 'Aviso publicado en Inicio (no hay fans registrados aún)' });
            }
            
            const values = rows.map(r => [r.id, 'aviso', mensaje, autor]);
            
            db.query('INSERT INTO notificaciones (usuario_id, tipo, mensaje, remitente_username) VALUES ?', [values], (err) => {
                if (err) return next(err); 
                res.json({ message: 'Aviso publicado en Inicio y notificado a todos los fans' });
            });
        });
    });
});

app.get('/api/avisos_globales/ultimo', verificarToken, (req, res, next) => {
    db.execute('SELECT * FROM avisos_globales ORDER BY id DESC LIMIT 1', (err, rows) => {
        if (err) return next(err); 
        res.json(rows.length > 0 ? rows[0] : null);
    });
});

app.put('/api/avisos_globales/:id', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('UPDATE avisos_globales SET mensaje = ? WHERE id = ?', [req.body.mensaje, req.params.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Aviso actualizado exitosamente' });
    });
});

app.delete('/api/avisos_globales/:id', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('DELETE FROM avisos_globales WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Aviso eliminado de la pantalla principal' });
    });
});

// --- CANCIONES (SIN IMAGEN_URL) ---
app.get('/api/canciones', (req, res, next) => {
    db.execute('SELECT * FROM canciones ORDER BY id DESC', (err, rows) => {
        if (err) return next(err); 
        res.json(rows);
    });
});

app.post('/api/canciones', verificarToken, verificarAdmin, (req, res, next) => { 
    const { titulo, artista, genero } = req.body;
    
    if (!titulo || !artista || !genero) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // --- LÓGICA PARA ASIGNAR IMAGEN AUTOMÁTICA ---
    // Si no encontramos imagen, usamos esta por defecto:
    let imagen_url = '/img/placeholder.png';
    const carpetaImg = path.join(__dirname, '../frontend-react/public/img');
    const extensiones = ['.jpg', '.jpeg', '.png', '.webp'];

    // Buscamos si existe un archivo con el nombre exacto del título
    for (const ext of extensiones) {
        if (fs.existsSync(path.join(carpetaImg, `${titulo}${ext}`))) {
            imagen_url = `/img/${titulo}${ext}`;
            break;
        }
    }

    const query = 'INSERT INTO canciones (titulo, artista, genero, imagen_url) VALUES (?, ?, ?, ?)';
    const params = [titulo, artista, genero, imagen_url];

    db.execute(
        query, 
        params, 
        (err) => {
            if (err) return next(err); 
            res.status(201).json({ message: 'Canción agregada con éxito' });
        }
    );
});

app.put('/api/canciones/:id', verificarToken, verificarAdmin, (req, res, next) => { 
    const { titulo, artista, genero } = req.body;
    
    db.execute(
        'UPDATE canciones SET titulo = ?, artista = ?, genero = ? WHERE id = ?', 
        [titulo, artista, genero, req.params.id], 
        (err) => {
            if (err) return next(err); 
            res.json({ message: 'Canción actualizada' });
        }
    );
});

app.delete('/api/canciones/:id', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('DELETE FROM canciones WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Canción eliminada' });
    });
});

// --- TAREAS / ALBUMES (SIN IMAGEN_URL) ---
app.get('/api/tareas', (req, res, next) => {
    db.execute('SELECT * FROM tareas ORDER BY id DESC', (err, rows) => {
        if (err) return next(err); 
        res.json(rows);
    });
});

app.post('/api/tareas', verificarToken, verificarAdmin, (req, res, next) => {
    const { titulo, descripcion, prioridad } = req.body;
    
    // --- LÓGICA IMAGEN AUTOMÁTICA (ALBUMES) ---
    let imagen_url = '/img/placeholder.png';
    const carpetaImg = path.join(__dirname, '../frontend-react/public/img');
    const extensiones = ['.jpg', '.jpeg', '.png', '.webp'];

    for (const ext of extensiones) {
        if (fs.existsSync(path.join(carpetaImg, `${titulo}${ext}`))) {
            imagen_url = `/img/${titulo}${ext}`;
            break;
        }
    }

    db.execute(
        'INSERT INTO tareas (titulo, descripcion, prioridad, imagen_url) VALUES (?, ?, ?, ?)', 
        [titulo, descripcion, prioridad, imagen_url], 
        (err) => {
            if (err) return next(err); 
            res.status(201).json({ message: 'Álbum creado exitosamente' });
        }
    );
});

app.put('/api/tareas/:id', verificarToken, verificarAdmin, (req, res, next) => { 
    db.execute('UPDATE tareas SET completada = ? WHERE id = ?', [req.body.completada, req.params.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Estado actualizado' });
    });
});

app.put('/api/tareas/editar/:id', verificarToken, verificarAdmin, (req, res, next) => { 
    const { titulo, descripcion, prioridad } = req.body;
    
    db.execute(
        'UPDATE tareas SET titulo = ?, descripcion = ?, prioridad = ? WHERE id = ?', 
        [titulo, descripcion, prioridad, req.params.id], 
        (err) => {
            if (err) return next(err); 
            res.json({ message: 'Álbum actualizado' });
        }
    );
});

app.delete('/api/tareas/:id', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('DELETE FROM tareas WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Álbum eliminado' });
    });
});

// --- FOROS ---
app.get('/api/foros', verificarToken, (req, res, next) => {
    let query = 'SELECT f.*, u.username as autor FROM foros f JOIN users u ON f.user_id = u.id';
    
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
    
    db.execute(
        'INSERT INTO foros (titulo, descripcion, user_id, estado) VALUES (?, ?, ?, "pendiente")', 
        [titulo, descripcion, req.user.id], 
        (err) => {
            if (err) return next(err); 
            res.status(201).json({ message: 'Tema propuesto exitosamente.' });
        }
    );
});

app.put('/api/foros/:id/estado', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('UPDATE foros SET estado = ? WHERE id = ?', [req.body.estado, req.params.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Estado del foro actualizado' });
    });
});

app.delete('/api/foros/:id', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('DELETE FROM foros WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Foro eliminado' });
    });
});

// --- EVENTOS ---
app.get('/api/eventos', (req, res, next) => {
    db.execute('SELECT * FROM eventos ORDER BY fecha ASC', (err, rows) => {
        if (err) return next(err); 
        res.json(rows);
    });
});

app.post('/api/eventos', verificarToken, verificarAdmin, (req, res, next) => {
    const { nombre, fecha, lugar } = req.body;
    
    // --- LÓGICA IMAGEN AUTOMÁTICA (EVENTOS) ---
    let imagen_url = '/img/placeholder.png';
    const carpetaImg = path.join(__dirname, '../frontend-react/public/img');
    const extensiones = ['.jpg', '.jpeg', '.png', '.webp'];

    for (const ext of extensiones) {
        if (fs.existsSync(path.join(carpetaImg, `${nombre}${ext}`))) {
            imagen_url = `/img/${nombre}${ext}`;
            break;
        }
    }

    db.execute(
        'INSERT INTO eventos (nombre, fecha, lugar, imagen_url) VALUES (?, ?, ?, ?)', 
        [nombre, fecha, lugar, imagen_url], 
        (err) => {
            if (err) return next(err); 
            res.status(201).json({ message: 'Evento creado' });
        }
    );
});

app.put('/api/eventos/:id', verificarToken, verificarAdmin, (req, res, next) => { 
    const { nombre, fecha, lugar } = req.body;
    
    db.execute(
        'UPDATE eventos SET nombre = ?, fecha = ?, lugar = ? WHERE id = ?', 
        [nombre, fecha, lugar, req.params.id], 
        (err) => {
            if (err) return next(err); 
            res.json({ message: 'Evento actualizado' });
        }
    );
});

app.delete('/api/eventos/:id', verificarToken, verificarAdmin, (req, res, next) => {
    db.execute('DELETE FROM eventos WHERE id = ?', [req.params.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Evento eliminado' });
    });
});

// --- SUGERENCIAS ---
app.get('/api/sugerencias', verificarToken, (req, res, next) => {
    db.execute(
        'SELECT s.*, u.username as autor FROM sugerencias s JOIN users u ON s.user_id = u.id ORDER BY s.fecha_creacion DESC', 
        (err, rows) => {
            if (err) return next(err); 
            res.json(rows);
        }
    );
});

app.post('/api/sugerencias', verificarToken, (req, res, next) => {
    if (req.user.rol === 'admin') {
        return res.status(403).json({ message: 'Los administradores no pueden crear sugerencias.' });
    }
    
    let { titulo, descripcion, imagen_url } = req.body;
    
    if (!imagen_url) {
        imagen_url = 'https://via.placeholder.com/300x200/111111/ff0000?text=IDEA+MUSICAL';
    }
    
    db.execute(
        'INSERT INTO sugerencias (titulo, descripcion, imagen_url, user_id) VALUES (?, ?, ?, ?)', 
        [titulo, descripcion, imagen_url, req.user.id], 
        (err) => {
            if (err) return next(err); 
            res.status(201).json({ message: 'Sugerencia publicada' });
        }
    );
});

app.put('/api/sugerencias/:id', verificarToken, (req, res, next) => {
    const { titulo, descripcion, imagen_url } = req.body;
    
    db.execute(
        'UPDATE sugerencias SET titulo = ?, descripcion = ?, imagen_url = ? WHERE id = ? AND user_id = ?', 
        [titulo, descripcion, imagen_url, req.params.id, req.user.id], 
        (err, result) => {
            if (err) return next(err);
            if (result.affectedRows === 0) {
                return res.status(403).json({ message: 'No puedes editar una sugerencia que no te pertenece.' });
            }
            res.json({ message: 'Sugerencia actualizada' });
        }
    );
});

app.delete('/api/sugerencias/:id', verificarToken, (req, res, next) => {
    let query = 'DELETE FROM sugerencias WHERE id = ?';
    let params = [req.params.id];
    
    if (req.user.rol !== 'admin') { 
        query += ' AND user_id = ?'; 
        params.push(req.user.id); 
    }
    
    db.execute(query, params, (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'No tienes permisos para borrar esta sugerencia.' });
        }
        res.json({ message: 'Sugerencia eliminada' });
    });
});

// --- COMENTARIOS Y CALIFICACIONES ---
app.get('/api/comentarios/:tipo/:id', (req, res, next) => {
    db.execute(
        'SELECT c.*, u.username FROM comentarios c JOIN users u ON c.user_id = u.id WHERE c.tipo_entidad = ? AND c.entidad_id = ? ORDER BY c.fecha_creacion DESC', 
        [req.params.tipo, req.params.id], 
        (err, rows) => {
            if (err) return next(err); 
            res.json(rows);
        }
    );
});

app.post('/api/comentarios', verificarToken, (req, res, next) => {
    const { entidad_id, tipo_entidad, comentario } = req.body;
    
    db.execute(
        'INSERT INTO comentarios (user_id, entidad_id, tipo_entidad, comentario) VALUES (?, ?, ?, ?)', 
        [req.user.id, entidad_id, tipo_entidad, comentario], 
        (err) => {
            if (err) return next(err); 
            res.status(201).json({ message: 'Comentario publicado' });
        }
    );
});

app.put('/api/comentarios/:id', verificarToken, (req, res, next) => {
    db.execute(
        'UPDATE comentarios SET comentario = ? WHERE id = ? AND user_id = ?', 
        [req.body.comentario, req.params.id, req.user.id], 
        (err, result) => {
            if (err) return next(err);
            if (result.affectedRows === 0) {
                return res.status(403).json({ message: 'No puedes editar este comentario' });
            }
            res.json({ message: 'Comentario actualizado' });
        }
    );
});

app.delete('/api/comentarios/:id', verificarToken, (req, res, next) => {
    let query = 'DELETE FROM comentarios WHERE id = ?'; 
    let params = [req.params.id];
    
    if (req.user.rol !== 'admin') { 
        query += ' AND user_id = ?'; 
        params.push(req.user.id); 
    }
    
    db.execute(query, params, (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'No tienes permisos para borrar este comentario' });
        }
        res.json({ message: 'Comentario eliminado' });
    });
});

app.get('/api/calificaciones/:tipo/:id', (req, res, next) => {
    db.execute(
        'SELECT AVG(puntuacion) as promedio, COUNT(id) as total FROM calificaciones WHERE tipo_entidad = ? AND entidad_id = ?', 
        [req.params.tipo, req.params.id], 
        (err, rows) => {
            if (err) return next(err); 
            res.json(rows[0]);
        }
    );
});

app.get('/api/calificaciones/mivoto/:tipo/:id', verificarToken, (req, res, next) => {
    db.execute(
        'SELECT puntuacion FROM calificaciones WHERE tipo_entidad = ? AND entidad_id = ? AND user_id = ?', 
        [req.params.tipo, req.params.id, req.user.id], 
        (err, rows) => {
            if (err) return next(err); 
            res.json({ miVoto: rows.length > 0 ? rows[0].puntuacion : null });
        }
    );
});

app.post('/api/calificaciones', verificarToken, (req, res, next) => {
    const { entidad_id, tipo_entidad, puntuacion } = req.body;
    
    db.execute(
        'INSERT INTO calificaciones (user_id, entidad_id, tipo_entidad, puntuacion) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE puntuacion = VALUES(puntuacion)', 
        [req.user.id, entidad_id, tipo_entidad, puntuacion], 
        (err) => {
            if (err) return next(err); 
            res.json({ message: 'Calificación guardada exitosamente' });
        }
    );
});

// --- PERFIL Y PRIVACIDAD ---
app.get('/api/perfil', verificarToken, (req, res, next) => {
    db.execute(
        'SELECT id, username, email, rol, descripcion, fecha_registro, foto_perfil, privacidad FROM users WHERE id = ?', 
        [req.user.id], 
        (err, userRows) => {
            if (err) return next(err);
            if (userRows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            const userData = userRows[0];
            
            db.execute('SELECT * FROM foros WHERE user_id = ? ORDER BY fecha_creacion DESC', [req.user.id], (err, forosRows) => {
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
                
                db.execute(queryFavoritos, [req.user.id, req.user.id], (err, favoritosRows) => {
                    if (err) return next(err); 
                    res.json({ 
                        usuario: userData, 
                        foros: forosRows, 
                        favoritos: favoritosRows 
                    });
                });
            });
        }
    );
});

app.get('/api/perfil/publico/:username', verificarToken, (req, res, next) => {
    db.execute(
        'SELECT id, username, rol, descripcion, fecha_registro, foto_perfil, privacidad FROM users WHERE username = ?', 
        [req.params.username], 
        (err, rows) => {
            if (err) return next(err);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            const targetUser = rows[0];
            
            if (targetUser.privacidad === 'privado' && req.user.rol !== 'admin' && req.user.username !== targetUser.username) {
                return res.json({ 
                    privado: true, 
                    usuario: { 
                        username: targetUser.username, 
                        fecha_registro: targetUser.fecha_registro, 
                        foto_perfil: targetUser.foto_perfil 
                    } 
                });
            }
            
            db.execute('SELECT * FROM foros WHERE user_id = ? ORDER BY fecha_creacion DESC', [targetUser.id], (err, forosRows) => {
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
                
                db.execute(queryFavoritos, [targetUser.id, targetUser.id], (err, favoritosRows) => {
                    if (err) return next(err); 
                    res.json({ 
                        privado: false, 
                        usuario: targetUser, 
                        foros: forosRows, 
                        favoritos: favoritosRows 
                    });
                });
            });
        }
    );
});

app.put('/api/perfil/descripcion', verificarToken, (req, res, next) => {
    db.execute('UPDATE users SET descripcion = ? WHERE id = ?', [req.body.descripcion, req.user.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Descripción actualizada' });
    });
});

app.put('/api/perfil/privacidad', verificarToken, (req, res, next) => {
    db.execute('UPDATE users SET privacidad = ? WHERE id = ?', [req.body.privacidad, req.user.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Privacidad actualizada' });
    });
});

app.put('/api/perfil/foto', verificarToken, (req, res, next) => {
    db.execute('UPDATE users SET foto_perfil = ? WHERE id = ?', [req.body.foto_perfil, req.user.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Foto actualizada' });
    });
});

// --- RED SOCIAL Y CHAT ---
app.get('/api/fans', verificarToken, (req, res, next) => {
    db.execute(
        'SELECT id, username, rol, descripcion, fecha_registro, foto_perfil FROM users WHERE id != ? AND rol = "fan" ORDER BY username ASC', 
        [req.user.id], 
        (err, rows) => {
            if (err) return next(err); 
            res.json(rows);
        }
    );
});

app.post('/api/seguir/:id', verificarToken, (req, res, next) => {
    const seguido_id = req.params.id;
    const seguidor_id = req.user.id;
    
    db.execute('SELECT rol FROM users WHERE id = ?', [seguido_id], (err, rows) => {
        if (err) return next(err);
        
        if (rows.length > 0 && rows[0].rol === 'admin') {
            return res.status(403).json({ message: 'No puedes agregar a un administrador.' });
        }

        db.execute('INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)', [seguidor_id, seguido_id], (err) => {
            if (err && err.code === 'ER_DUP_ENTRY') {
                db.execute('DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?', [seguidor_id, seguido_id], (errDel) => {
                    if (errDel) return next(errDel); 
                    res.json({ message: 'Amigo eliminado', siguiendo: false });
                });
            } else if (err) { 
                return next(err); 
            } else { 
                db.execute(
                    'INSERT INTO notificaciones (usuario_id, tipo, mensaje, remitente_username) VALUES (?, "seguidor", ?, ?)', 
                    [seguido_id, `@${req.user.username} te ha agregado como amigo.`, req.user.username]
                );
                res.json({ message: 'Amigo agregado a tu lista', siguiendo: true }); 
            }
        });
    });
});

app.get('/api/mis_amigos', verificarToken, (req, res, next) => {
    db.execute(
        'SELECT u.id, u.username, u.foto_perfil FROM seguidores s JOIN users u ON s.seguido_id = u.id WHERE s.seguidor_id = ?', 
        [req.user.id], 
        (err, rows) => {
            if (err) return next(err); 
            res.json(rows);
        }
    );
});

app.get('/api/notificaciones', verificarToken, (req, res, next) => {
    const userId = req.user.id;
    
    // 1. Limpieza automática: Borramos notificaciones viejas (dejamos solo las 10 más recientes)
    const queryLimpieza = `
        DELETE FROM notificaciones 
        WHERE usuario_id = ? AND id NOT IN (
            SELECT id FROM (
                SELECT id FROM notificaciones WHERE usuario_id = ? ORDER BY fecha_creacion DESC LIMIT 10
            ) as t
        )
    `;
    
    db.execute(queryLimpieza, [userId, userId], (err) => {
        if (err) return next(err);
        
        // 2. Traer mensajes no leídos (agrupados por usuario)
        const queryMensajes = `
            SELECT u.id as remitente_id, u.username as remitente_username, COUNT(m.id) as cantidad, MAX(m.fecha_envio) as fecha_creacion 
            FROM mensajes_directos m 
            JOIN users u ON m.emisor_id = u.id 
            WHERE m.receptor_id = ? AND m.leido = FALSE 
            GROUP BY u.id
        `;
        
        // 3. Traer las demás notificaciones no leídas
        const queryNotif = `
            SELECT * FROM notificaciones 
            WHERE usuario_id = ? AND leido = FALSE 
            ORDER BY fecha_creacion DESC
        `;
        
        db.execute(queryMensajes, [userId], (err, mensajesRows) => {
            if (err) return next(err);
            
            db.execute(queryNotif, [userId], (err, notifRows) => {
                if (err) return next(err);
                
                const notificacionesTotales = [
                    ...mensajesRows.map(m => ({ 
                        id: 'msg_' + m.remitente_username, 
                        tipo: 'mensaje', 
                        mensaje: `Tienes ${m.cantidad} mensaje(s) nuevo(s) de @${m.remitente_username}`, 
                        remitente_username: m.remitente_username, 
                        remitente_id: m.remitente_id, 
                        fecha_creacion: m.fecha_creacion 
                    })),
                    ...notifRows
                ];
                
                // Ordenar para mostrar siempre la más reciente arriba
                notificacionesTotales.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
                res.json(notificacionesTotales.slice(0, 10)); // Nos aseguramos de mandar solo 10 al cliente
            });
        });
    });
});

app.put('/api/notificaciones/:id/leido', verificarToken, (req, res, next) => {
    db.execute('UPDATE notificaciones SET leido = TRUE WHERE id = ? AND usuario_id = ?', [req.params.id, req.user.id], (err) => {
        if (err) return next(err); 
        res.json({ message: 'Notificación marcada como leída' });
    });
});

app.get('/api/mensajes/:otroUsuarioId', verificarToken, (req, res, next) => {
    db.execute(
        'SELECT * FROM mensajes_directos WHERE (emisor_id = ? AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = ?) ORDER BY fecha_envio ASC', 
        [req.user.id, req.params.otroUsuarioId, req.params.otroUsuarioId, req.user.id], 
        (err, rows) => {
            if (err) return next(err); 
            res.json(rows);
        }
    );
});

app.post('/api/mensajes', verificarToken, (req, res, next) => {
    db.execute(
        'INSERT INTO mensajes_directos (emisor_id, receptor_id, mensaje) VALUES (?, ?, ?)', 
        [req.user.id, req.body.receptor_id, req.body.mensaje], 
        (err) => {
            if (err) return next(err); 
            res.status(201).json({ message: 'Mensaje enviado' });
        }
    );
});

app.put('/api/mensajes/marcar_leidos/:otroUsuarioId', verificarToken, (req, res, next) => {
    db.execute(
        'UPDATE mensajes_directos SET leido = TRUE WHERE emisor_id = ? AND receptor_id = ?', 
        [req.params.otroUsuarioId, req.user.id], 
        (err) => {
            if (err) return next(err); 
            res.json({ message: 'Mensajes marcados como leídos' });
        }
    );
});

// --- MANEJO CENTRALIZADO DE ERRORES ---
app.use((err, req, res, next) => {
    console.error('[Error Interno del Servidor]:', err.stack);
    res.status(500).json({ 
        status: 'error', 
        message: 'Ocurrió un error inesperado en el servidor.' 
    });
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo exitosamente en el puerto http://localhost:${PORT}`);
});
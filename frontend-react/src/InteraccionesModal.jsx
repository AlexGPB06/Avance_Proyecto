import { useState, useEffect } from 'react';
import axios from 'axios';
import './Css/styles.css';

const API_URL = 'http://localhost:3000/api';

function InteraccionesModal({ item, tipoEntidad, onClose }) {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [calificacion, setCalificacion] = useState({ promedio: 0, total: 0 });

    const token = localStorage.getItem('token');
    const authAxios = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        cargarComentarios();
        cargarCalificacion();
    }, []);

    const cargarComentarios = async () => {
        try {
            const res = await authAxios.get(`/comentarios/${tipoEntidad}/${item.id}`);
            setComentarios(res.data);
        } catch (error) { console.error("Error al cargar comentarios", error); }
    };

    const cargarCalificacion = async () => {
        try {
            const res = await authAxios.get(`/calificaciones/${tipoEntidad}/${item.id}`);
            setCalificacion({
                promedio: parseFloat(res.data.promedio || 0).toFixed(1),
                total: res.data.total
            });
        } catch (error) { console.error("Error al cargar calificación", error); }
    };

    const handleComentar = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        try {
            await authAxios.post('/comentarios', {
                entidad_id: item.id,
                tipo_entidad: tipoEntidad,
                comentario: nuevoComentario
            });
            setNuevoComentario('');
            cargarComentarios(); // Recargar la lista
        } catch (error) { alert('Error al comentar'); }
    };

    const handleCalificar = async (puntos) => {
        try {
            await authAxios.post('/calificaciones', {
                entidad_id: item.id,
                tipo_entidad: tipoEntidad,
                puntuacion: puntos
            });
            cargarCalificacion(); // Recargar promedio
        } catch (error) { alert('Error al calificar'); }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h2>💬 {item.titulo}</h2>
                    <span className="close-btn" onClick={onClose}>&times;</span>
                </div>
                
                    {/* Solo mostramos la sección de estrellas si NO es un foro */}
                    {tipoEntidad !== 'foro' && (
                        <div className="calificacion-section" style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <h3>⭐ Promedio: {calificacion.promedio} <small>({calificacion.total} votos)</small></h3>
                            <p>Tu calificación:</p>
                            <div style={{ fontSize: '2em', cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <span key={num} onClick={() => handleCalificar(num)}>★</span>
                                ))}
                            </div>
                        </div>
                    )}
  

                <div className="comentarios-lista" style={{ background: '#000', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    {comentarios.length === 0 ? <p>No hay comentarios aún. ¡Sé el primero!</p> : null}
                    {comentarios.map(c => (
                        <div key={c.id} style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                            <strong style={{ color: 'var(--highlight-color)' }}>{c.username}</strong>
                            <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '10px' }}>
                                {new Date(c.fecha_creacion).toLocaleDateString()}
                            </span>
                            <p style={{ margin: '5px 0' }}>{c.comentario}</p>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleComentar} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Escribe un comentario..." 
                        value={nuevoComentario} 
                        onChange={(e) => setNuevoComentario(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="btn-add">ENVIAR</button>
                </form>
            </div>
        </div>
    );
}

export default InteraccionesModal;
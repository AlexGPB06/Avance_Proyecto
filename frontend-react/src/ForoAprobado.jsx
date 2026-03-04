import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function ForoAprobado({ foro, onBack }) {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');

    const token = localStorage.getItem('token');
    const authAxios = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        cargarComentarios();
    }, []);

    const cargarComentarios = async () => {
        try {
            const res = await authAxios.get(`/comentarios/foro/${foro.id}`);
            setComentarios(res.data);
        } catch (error) { 
            console.error("Error al cargar comentarios", error); 
        }
    };

    const handleComentar = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        try {
            await authAxios.post('/comentarios', {
                entidad_id: foro.id,
                tipo_entidad: 'foro',
                comentario: nuevoComentario
            });
            setNuevoComentario('');
            cargarComentarios(); // Recargar el feed
        } catch (error) { 
            alert('Error al publicar respuesta'); 
        }
    };

    return (
        <section className="section active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* CABECERA DEL FORO */}
            <div className="foro-header" style={{ borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                <button 
                    onClick={onBack} 
                    className="btn-cancel" 
                    style={{ marginBottom: '15px', padding: '5px 15px', fontSize: '0.9em' }}
                >
                    ⬅ VOLVER A FOROS
                </button>
                <h2 style={{ color: 'var(--highlight-color)', fontSize: '2em', margin: '0 0 5px 0' }}>
                    {foro.titulo}
                </h2>
                <p style={{ color: '#888', margin: 0 }}>
                    Iniciado por <strong>@{foro.autor}</strong> el {new Date(foro.fecha_creacion).toLocaleDateString()}
                </p>
            </div>

            {/* FEED DE COMENTARIOS (Estilo Twitter/Reddit) */}
            <div className="comentarios-feed" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '10px', marginBottom: '20px' }}>
                {comentarios.length === 0 ? (
                    <p className="empty-message" style={{ textAlign: 'center', marginTop: '50px' }}>
                        No hay respuestas aún. ¡Sé el primero en opinar!
                    </p>
                ) : (
                    comentarios.map(c => (
                        <div key={c.id} className="comentario-card" style={{ 
                            background: '#1a1a1a', 
                            padding: '15px 20px', 
                            borderRadius: '8px', 
                            borderLeft: '4px solid var(--highlight-color)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <strong style={{ color: '#fff', fontSize: '1.1em' }}>@{c.username}</strong>
                                <span style={{ color: '#666', fontSize: '0.8em' }}>
                                    {new Date(c.fecha_creacion).toLocaleString()}
                                </span>
                            </div>
                            <p style={{ margin: 0, color: '#ddd', lineHeight: '1.5', fontSize: '1.05em' }}>
                                {c.comentario}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* CAJA DE RESPUESTA FIJA AL FONDO */}
            <div className="form-section" style={{ marginTop: 'auto', marginBottom: '0', padding: '15px', background: '#0a0a0a', border: '1px solid #333' }}>
                <form onSubmit={handleComentar} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Escribe tu respuesta aquí..." 
                        value={nuevoComentario} 
                        onChange={(e) => setNuevoComentario(e.target.value)} 
                        style={{ flexGrow: 1, margin: 0 }}
                        required 
                    />
                    <button type="submit" className="btn-add" style={{ margin: 0 }}>RESPONDER</button>
                </form>
            </div>
        </section>
    );
}

export default ForoAprobado;
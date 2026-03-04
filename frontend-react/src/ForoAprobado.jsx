import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function ForoAprobado({ foro, onBack }) {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    
    // Estado para controlar el orden (Por defecto false = Viejos arriba, Nuevos abajo)
    const [recientesPrimero, setRecientesPrimero] = useState(false); 

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
            cargarComentarios(); 
        } catch (error) { 
            alert('Error al publicar respuesta'); 
        }
    };

    // Lógica para ordenar los comentarios antes de renderizarlos
    const comentariosOrdenados = [...comentarios].sort((a, b) => {
        const fechaA = new Date(a.fecha_creacion);
        const fechaB = new Date(b.fecha_creacion);
        return recientesPrimero ? fechaB - fechaA : fechaA - fechaB;
    });

    return (
        <section className="section active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* CABECERA DEL FORO */}
            <div className="foro-header" style={{ borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={onBack} className="btn-cancel" style={{ padding: '5px 15px', fontSize: '0.9em' }}>
                        ⬅ VOLVER A FOROS
                    </button>
                    
                    {/* Botón de Filtro */}
                    <button 
                        onClick={() => setRecientesPrimero(!recientesPrimero)} 
                        style={{ background: '#222', color: '#fff', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        ↕️ {recientesPrimero ? 'Ver más antiguos primero' : 'Ver más recientes primero'}
                    </button>
                </div>

                <h2 style={{ color: 'var(--highlight-color)', fontSize: '2em', margin: '15px 0 5px 0' }}>
                    {foro.titulo}
                </h2>
                <p style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.9em' }}>
                    Iniciado por <strong>@{foro.autor}</strong> el {new Date(foro.fecha_creacion).toLocaleDateString()}
                </p>

                {/* POST ORIGINAL (La descripción del foro) */}
                <div style={{ background: '#111', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #888', marginTop: '10px' }}>
                    <p style={{ margin: 0, color: '#eee', fontSize: '1.1em', lineHeight: '1.5' }}>
                        {foro.descripcion}
                    </p>
                </div>
            </div>

            {/* FEED DE COMENTARIOS */}
            <div className="comentarios-feed" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '10px', paddingBottom: '20px' }}>
                {comentariosOrdenados.length === 0 ? (
                    <p className="empty-message" style={{ textAlign: 'center', marginTop: '30px' }}>
                        No hay respuestas aún. ¡Sé el primero en opinar!
                    </p>
                ) : (
                    comentariosOrdenados.map(c => (
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

            {/* CAJA DE RESPUESTA */}
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
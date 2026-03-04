import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function InteraccionesModal({ item, tipoEntidad, onClose }) {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [calificacion, setCalificacion] = useState({ promedio: 0, total: 0 });
    const [inputCalificacion, setInputCalificacion] = useState('');

    // Estados de edición
    const [editandoId, setEditandoId] = useState(null);
    const [textoEditado, setTextoEditado] = useState('');

    const currentUser = localStorage.getItem('currentUser')?.toUpperCase() || '';
    const userRol = localStorage.getItem('userRol') || 'fan';
    const token = localStorage.getItem('token');

    const authAxios = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        if (item && item.id) {
            cargarComentarios();
            cargarCalificacion();
        }
    }, [item, tipoEntidad]);

    const cargarComentarios = async () => {
        try {
            // El "?t=" evita el bug del caché que hacía que los comentarios "desaparecieran"
            const res = await authAxios.get(`/comentarios/${tipoEntidad}/${item.id}?t=${new Date().getTime()}`);
            setComentarios(res.data); // Ya viene ordenado de Nuevos a Viejos desde tu Backend
        } catch (error) { console.error("Error al cargar comentarios", error); }
    };

    const cargarCalificacion = async () => {
        try {
            const res = await authAxios.get(`/calificaciones/${tipoEntidad}/${item.id}?t=${new Date().getTime()}`);
            setCalificacion({
                promedio: parseFloat(res.data.promedio || 0).toFixed(1),
                total: res.data.total
            });
        } catch (error) { console.error("Error al cargar calificación", error); }
    };

    const handleCalificar = async (e) => {
        e.preventDefault();
        try {
            const valorNumerico = parseFloat(inputCalificacion);
            if (isNaN(valorNumerico)) throw new Error("Ingresa un número.");
            
            const valoresPermitidos = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
            if (!valoresPermitidos.includes(valorNumerico)) {
                throw new Error("Solo valores exactos (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5).");
            }

            await authAxios.post('/calificaciones', {
                entidad_id: item.id,
                tipo_entidad: tipoEntidad,
                puntuacion: valorNumerico
            });
            
            cargarCalificacion();
            setInputCalificacion('');
            alert(`¡Calificación de ${valorNumerico} guardada!`);
        } catch (error) {
            alert(error.message || 'Error al calificar');
        }
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
            cargarComentarios();
        } catch (error) { alert('Error al comentar'); }
    };

    const handleBorrarComentario = async (id) => {
        if (!window.confirm('¿Borrar este comentario permanentemente?')) return;
        try {
            await authAxios.delete(`/comentarios/${id}`);
            cargarComentarios();
        } catch (error) {
            alert('Error al borrar: Privilegios insuficientes');
        }
    };

    const iniciarEdicion = (c) => {
        setEditandoId(c.id);
        setTextoEditado(c.comentario);
    };

    const handleGuardarEdicion = async (id) => {
        if (!textoEditado.trim()) return;
        try {
            await authAxios.put(`/comentarios/${id}`, { comentario: textoEditado });
            setEditandoId(null);
            cargarComentarios();
        } catch (error) { alert('Error al editar'); }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
            <div style={{
                backgroundColor: '#111', border: '3px solid var(--highlight-color, red)', borderRadius: '8px',
                width: '90%', maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '20px',
                boxShadow: '0 0 30px rgba(0,0,0,0.9)', position: 'relative'
            }}>
                {/* HEADER CON BOTON X (POP-UP) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5em' }}>💬 {item.titulo || item.nombre}</h2>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: '#fff', fontSize: '2em', cursor: 'pointer', fontWeight: 'bold', lineHeight: '1'
                    }}>&times;</button>
                </div>

                {/* SECCIÓN DE CALIFICACIÓN */}
                {tipoEntidad !== 'foro' && (
                    <div style={{ textAlign: 'center', background: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #333', marginBottom: '15px' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: 'gold' }}>⭐ Promedio: {calificacion.promedio} <small style={{color:'#888', fontSize: '0.7em'}}>({calificacion.total} votos)</small></h3>
                        <form onSubmit={handleCalificar} style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
                            <input 
                                type="number" step="0.5" 
                                placeholder="Ej: 4.5" value={inputCalificacion} onChange={(e) => setInputCalificacion(e.target.value)}
                                style={{ width: '80px', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }} required
                            />
                            <button type="submit" style={{ padding: '8px 15px', background: '#333', color: '#fff', border: '1px solid gold', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>VOTAR</button>
                        </form>
                    </div>
                )}

                {/* FORMULARIO PARA NUEVO COMENTARIO (Pegado arriba para inmediatez) */}
                <form onSubmit={handleComentar} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input 
                        type="text" placeholder="Escribe tu comentario aquí..." value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} 
                        style={{ flexGrow: 1, padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }} required 
                    />
                    <button type="submit" style={{ padding: '10px 15px', background: 'var(--highlight-color, red)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>PUBLICAR</button>
                </form>

                {/* LISTA DE COMENTARIOS (Nuevos hasta arriba) */}
                <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '10px' }}>
                    {comentarios.length === 0 && <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Aún no hay comentarios. ¡Sé el primero!</p>}
                    
                    {comentarios.map(c => {
                        const esMiComentario = c.username.toUpperCase() === currentUser;
                        const puedeBorrar = esMiComentario || userRol === 'admin';

                        return (
                            <div key={c.id} style={{ background: '#1a1a1a', padding: '15px', borderRadius: '6px', marginBottom: '10px', borderLeft: '4px solid #444' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div>
                                        <strong style={{ color: esMiComentario ? '#4ade80' : '#3b82f6' }}>{c.username} {esMiComentario && '(Tú)'}</strong>
                                        <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>{new Date(c.fecha_creacion).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        {esMiComentario && editandoId !== c.id && (
                                            <button onClick={() => iniciarEdicion(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}>✏️</button>
                                        )}
                                        {puedeBorrar && (
                                            <button onClick={() => handleBorrarComentario(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}>🗑️</button>
                                        )}
                                    </div>
                                </div>

                                {editandoId === c.id ? (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input 
                                            type="text" value={textoEditado} onChange={(e) => setTextoEditado(e.target.value)} 
                                            style={{ flexGrow: 1, padding: '5px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                                        />
                                        <button onClick={() => handleGuardarEdicion(c.id)} style={{ padding: '5px 10px', background: '#4ade80', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
                                        <button onClick={() => setEditandoId(null)} style={{ padding: '5px 10px', background: '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, color: '#ccc', lineHeight: '1.4' }}>{c.comentario}</p>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}

export default InteraccionesModal;
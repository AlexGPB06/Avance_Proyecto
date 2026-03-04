import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Perfil() {
    const [perfilData, setPerfilData] = useState(null);
    const [editandoDesc, setEditandoDesc] = useState(false);
    const [nuevaDesc, setNuevaDesc] = useState('');

    const token = localStorage.getItem('token');
    const authAxios = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            const res = await authAxios.get('/perfil');
            setPerfilData(res.data);
            setNuevaDesc(res.data.usuario.descripcion || '');
        } catch (error) {
            console.error("Error al cargar perfil", error);
        }
    };

    const handleActualizarDesc = async (e) => {
        e.preventDefault();
        try {
            await authAxios.put('/perfil/descripcion', { descripcion: nuevaDesc });
            setEditandoDesc(false);
            cargarPerfil();
            alert('💾 Descripción actualizada');
        } catch (error) {
            alert('Error al actualizar la descripción');
        }
    };

    if (!perfilData) return <p style={{ color: 'white', padding: '20px' }}>Cargando perfil...</p>;

    const { usuario, foros, favoritos } = perfilData;

    return (
        <section className="section active">
            <div className="section-header">
                <h2>👤 MI PERFIL</h2>
            </div>

            <div className="item-card" style={{ background: '#111', borderLeft: '4px solid var(--highlight-color)', marginBottom: '30px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '2.5em', margin: 0, color: 'var(--highlight-color)' }}>@{usuario.username}</h2>
                    <span style={{ background: usuario.rol === 'admin' ? 'red' : '#333', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                        {usuario.rol.toUpperCase()}
                    </span>
                </div>
                
                <p><strong>📧 CORREO:</strong> {usuario.email}</p>
                
                <div style={{ marginTop: '20px', background: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0, color: '#aaa' }}>📝 Sobre mí:</h3>
                        {!editandoDesc && (
                            <button onClick={() => setEditandoDesc(true)} className="btn-action" style={{ background: '#222', color: 'white', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                ✏️ Editar
                            </button>
                        )}
                    </div>

                    {editandoDesc ? (
                        <form onSubmit={handleActualizarDesc} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <textarea 
                                className="form-input" 
                                style={{ resize: 'vertical', minHeight: '80px', margin: 0 }}
                                value={nuevaDesc} 
                                onChange={(e) => setNuevaDesc(e.target.value)} 
                                required 
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-add" style={{ padding: '8px 15px', margin: 0 }}>💾 GUARDAR</button>
                                <button type="button" onClick={() => setEditandoDesc(false)} className="btn-cancel" style={{ padding: '8px 15px', margin: 0 }}>CANCELAR</button>
                            </div>
                        </form>
                    ) : (
                        <p style={{ margin: 0, fontSize: '1.1em', lineHeight: '1.5', color: '#eee' }}>
                            {usuario.descripcion}
                        </p>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                    <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', color: 'var(--highlight-color)' }}>🗣️ Mis Foros Creados</h3>
                    <div className="items-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {foros.length === 0 ? <p className="empty-message">No has creado ningún foro.</p> : (
                            foros.map(foro => (
                                <div key={foro.id} className="item-card foro-card" style={{ padding: '15px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>{foro.titulo}</h4>
                                    <span style={{
                                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.8em',
                                        background: foro.estado === 'aprobado' ? 'green' : foro.estado === 'rechazado' ? 'red' : 'orange',
                                        color: 'white', fontWeight: 'bold'
                                    }}>
                                        {foro.estado.toUpperCase()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', color: 'var(--highlight-color)' }}>⭐ Mis Favoritos</h3>
                    <div className="items-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {favoritos.length === 0 ? <p className="empty-message">No tienes favoritos.</p> : (
                            favoritos.map((fav, index) => (
                                <div key={index} className="item-card cancion-card" style={{ padding: '15px', borderLeft: fav.tipo === 'cancion' ? '4px solid #1db954' : '4px solid #9b59b6' }}>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{fav.titulo}</h4>
                                    <p style={{ margin: 0, color: '#aaa', fontSize: '0.8em' }}>{fav.subtitulo}</p>
                                    <div style={{ color: '#ffd700', fontSize: '1em', marginTop: '5px' }}>
                                        {'★'.repeat(fav.puntuacion)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Perfil;
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Perfil({ targetUsername, irAPerfil }) {
    const [perfilData, setPerfilData] = useState(null);
    const [misAmigos, setMisAmigos] = useState([]);
    const [esPrivado, setEsPrivado] = useState(false);
    
    // Estados para la foto
    const [editandoFoto, setEditandoFoto] = useState(false);
    const [nuevaFoto, setNuevaFoto] = useState('');

    // NUEVO: Estados para la descripción
    const [editandoDescripcion, setEditandoDescripcion] = useState(false);
    const [nuevaDescripcion, setNuevaDescripcion] = useState('');
    
    const currentUser = localStorage.getItem('currentUser')?.toUpperCase() || '';
    const token = localStorage.getItem('token');
    const authAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

    const esMiPerfil = !targetUsername || targetUsername.toUpperCase() === currentUser;

    useEffect(() => {
        cargarPerfil();
        if (esMiPerfil) cargarAmigos();
    }, [targetUsername]);

    const cargarPerfil = async () => {
        try {
            if (esMiPerfil) {
                const res = await authAxios.get('/perfil');
                setPerfilData(res.data);
                setEsPrivado(false);
            } else {
                const res = await authAxios.get(`/perfil/publico/${targetUsername}`);
                setEsPrivado(res.data.privado);
                setPerfilData(res.data);
            }
        } catch (error) { console.error("Error al cargar perfil", error); }
    };

    const cargarAmigos = async () => {
        try {
            const res = await authAxios.get('/mis_amigos');
            setMisAmigos(res.data);
        } catch (error) { console.error("Error al cargar amigos", error); }
    };

    const handleActualizarFoto = async (e) => {
        e.preventDefault();
        try {
            await authAxios.put('/perfil/foto', { foto_perfil: nuevaFoto });
            setEditandoFoto(false);
            cargarPerfil();
            alert('📸 Foto actualizada');
        } catch (error) { alert('Error al actualizar la foto'); }
    };

    // NUEVA FUNCIÓN: Guardar la descripción
    const handleActualizarDescripcion = async (e) => {
        e.preventDefault();
        try {
            await authAxios.put('/perfil/descripcion', { descripcion: nuevaDescripcion });
            setEditandoDescripcion(false);
            cargarPerfil();
        } catch (error) { alert('Error al actualizar la descripción'); }
    };

    if (!perfilData) return <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--highlight-color)' }}>Cargando perfil...</p>;
    const { usuario, foros, favoritos } = perfilData;

    return (
        <section className="animate-fade-in section active">
            <div className="section-header">
                <h2>{esMiPerfil ? '👤 MI PERFIL' : `👤 PERFIL DE @${usuario.username}`}</h2>
            </div>

            {esPrivado ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: '#0a0a0a', border: '3px solid #333', borderRadius: '8px' }}>
                    <h1 style={{ fontSize: '5em', margin: '0 0 20px 0', color: '#555' }}>🔒</h1>
                    <h2 style={{ color: '#fff', letterSpacing: '2px' }}>ESTA CUENTA ES PRIVADA</h2>
                    <p style={{ color: '#888', marginTop: '10px' }}>Solo sus amigos o administradores pueden ver su actividad.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '30px', alignItems: 'start' }}>
                    
                    {/* COLUMNA IZQUIERDA: Info del Usuario y Amigos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* TARJETA DE GAFETE VIP */}
                        <div className="item-card" style={{ padding: '30px 20px', textAlign: 'center', borderTop: '4px solid var(--highlight-color)' }}>
                            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '15px' }}>
                                <img src={usuario.foto_perfil || 'https://i.imgur.com/3p3E53e.png'} alt="Perfil" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 0 20px rgba(255,0,0,0.3)' }} />
                            </div>
                            
                            <h2 style={{ fontSize: '1.8em', color: 'var(--highlight-color)', margin: '0 0 5px 0' }}>@{usuario.username}</h2>
                            <span style={{ background: '#333', color: '#fff', padding: '3px 10px', borderRadius: '15px', fontSize: '0.8em', fontWeight: 'bold' }}>{usuario.rol?.toUpperCase() || 'FAN'}</span>
                            
                            <p style={{ color: '#888', marginTop: '15px', fontSize: '0.9em' }}>Unido el: <br/>{new Date(usuario.fecha_registro).toLocaleDateString()}</p>
                            
                            {/* NUEVO: LÓGICA DE EDICIÓN DE DESCRIPCIÓN */}
                            {editandoDescripcion ? (
                                <form onSubmit={handleActualizarDescripcion} style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <textarea 
                                        className="form-input" 
                                        value={nuevaDescripcion} 
                                        onChange={(e) => setNuevaDescripcion(e.target.value)} 
                                        placeholder="Escribe sobre ti..."
                                        style={{ resize: 'vertical', minHeight: '80px', margin: 0, fontSize: '0.9em' }}
                                        required 
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="submit" className="btn-primary" style={{ flexGrow: 1, padding: '8px' }}>✔</button>
                                        <button type="button" className="btn-secondary" onClick={() => setEditandoDescripcion(false)} style={{ flexGrow: 1, padding: '8px' }}>✖</button>
                                    </div>
                                </form>
                            ) : (
                                <div style={{ marginTop: '15px', position: 'relative' }}>
                                    <p style={{ fontStyle: 'italic', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#ddd', margin: 0 }}>
                                        "{usuario.descripcion || 'Sin descripción.'}"
                                    </p>
                                    
                                    {esMiPerfil && (
                                        <button 
                                            onClick={() => { setNuevaDescripcion(usuario.descripcion || ''); setEditandoDescripcion(true); }} 
                                            className="btn-secondary" 
                                            style={{ position: 'absolute', top: '-12px', right: '-12px', width: '35px', height: '35px', borderRadius: '50%', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid var(--highlight-color)' }}
                                            title="Editar Descripción"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                </div>
                            )}

                            {esMiPerfil && !editandoFoto && (
                                <button onClick={() => setEditandoFoto(true)} className="btn-secondary" style={{ width: '100%', marginTop: '20px' }}>📸 Cambiar Foto</button>
                            )}

                            {editandoFoto && (
                                <form onSubmit={handleActualizarFoto} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input type="text" className="form-input" placeholder="URL de nueva foto" value={nuevaFoto} onChange={(e) => setNuevaFoto(e.target.value)} required />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="submit" className="btn-primary" style={{ flexGrow: 1, padding: '8px' }}>✔</button>
                                        <button type="button" className="btn-secondary" onClick={() => setEditandoFoto(false)} style={{ flexGrow: 1, padding: '8px' }}>✖</button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* LISTA DE AMIGOS (Solo si es tu perfil) */}
                        {esMiPerfil && (
                            <div className="item-card" style={{ padding: '20px' }}>
                                <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '15px', fontSize: '1.2em' }}>👥 MIS AMIGOS</h3>
                                {misAmigos.length === 0 ? (
                                    <p className="empty-message" style={{ padding: '20px 0' }}>Aún no sigues a nadie.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {misAmigos.map(amigo => (
                                            <div key={amigo.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', transition: '0.2s' }} onClick={() => irAPerfil(amigo.username)} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,0,0,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                                                <img src={amigo.foto_perfil || 'https://i.imgur.com/3p3E53e.png'} alt="amigo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--highlight-color)' }} />
                                                <span style={{ fontWeight: 'bold', color: '#fff' }}>@{amigo.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Actividad (Foros y Calificaciones) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        
                        {/* CALIFICACIONES ALTAS */}
                        <div>
                            <h3 style={{ fontSize: '1.5em', color: '#fff', borderBottom: '2px solid var(--highlight-color)', paddingBottom: '10px', marginBottom: '20px' }}>
                                ⭐ FAVORITOS ({favoritos?.length || 0})
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                {favoritos?.length === 0 ? <p className="empty-message">No hay calificaciones altas.</p> : favoritos?.map((f,i) => (
                                    <div key={i} className="item-card" style={{ padding: '15px', borderLeft: f.tipo === 'cancion' ? '4px solid #3b82f6' : '4px solid #ec4899' }}>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1em' }}>{f.titulo}</h4>
                                        <p style={{ margin: 0, color: '#aaa', fontSize: '0.85em', textTransform: 'uppercase' }}>{f.tipo}</p>
                                        <p style={{ margin: '10px 0 0 0', color: 'gold', fontWeight: 'bold', fontSize: '1.2em' }}>{f.puntuacion} / 5 ⭐</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FOROS CREADOS */}
                        <div>
                            <h3 style={{ fontSize: '1.5em', color: '#fff', borderBottom: '2px solid var(--highlight-color)', paddingBottom: '10px', marginBottom: '20px' }}>
                                🗣️ TEMAS DE FORO INICIADOS
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {foros?.length === 0 ? <p className="empty-message">Aún no ha creado ningún tema.</p> : foros?.map(f => (
                                    <div key={f.id} className="item-card" style={{ padding: '15px 20px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flexGrow: 1 }}>
                                            <h4 style={{ margin: '0 0 5px 0', color: '#00e5ff', fontSize: '1.2em' }}>{f.titulo}</h4>
                                            <p style={{ margin: 0, color: '#888', fontSize: '0.9em' }}>{new Date(f.fecha_creacion).toLocaleDateString()}</p>
                                        </div>
                                        <span style={{ background: f.estado === 'aprobado' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.1)', color: f.estado === 'aprobado' ? '#4ade80' : '#aaa', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8em' }}>
                                            {f.estado.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </section>
    );
}

export default Perfil;
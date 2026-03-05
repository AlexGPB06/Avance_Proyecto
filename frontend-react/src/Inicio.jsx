import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Inicio({ userRol }) {
    const [destacados, setDestacados] = useState({ slots: [], canciones: [], albumes: [] });
    
    // Encuestas
    const [encuestaData, setEncuestaData] = useState(null);
    const [nuevaEncuesta, setNuevaEncuesta] = useState({ pregunta: '', opcion1: '', opcion2: '', opcion3: '', opcion4: '' });

    // Avisos Globales
    const [ultimoAviso, setUltimoAviso] = useState(null);
    const [modalAvisoAbierto, setModalAvisoAbierto] = useState(false);
    const [editandoAviso, setEditandoAviso] = useState(false);
    const [textoAvisoEditado, setTextoAvisoEditado] = useState('');

    const token = localStorage.getItem('token');
    const authAxios = axios.create({ 
        baseURL: API_URL, 
        headers: { Authorization: `Bearer ${token}` } 
    });

    useEffect(() => { 
        cargarTodo(); 
    }, []);

    const cargarTodo = async () => {
        try {
            const [resDestacados, resEncuesta, resAviso] = await Promise.all([
                authAxios.get('/inicio/destacados'),
                authAxios.get('/encuestas/activa'),
                authAxios.get('/avisos_globales/ultimo')
            ]);
            setDestacados(resDestacados.data);
            setEncuestaData(resEncuesta.data);
            setUltimoAviso(resAviso.data);
        } catch (error) { 
            console.error("Error al cargar la pantalla de inicio", error); 
        }
    };

    const handleActualizarSlot = async (slotName, itemId) => {
        try { 
            await authAxios.put('/inicio/destacados', { slot: slotName, item_id: itemId }); 
            cargarTodo(); 
        } catch (error) { 
            alert("Error al actualizar el elemento destacado"); 
        }
    };

    const handleCrearEncuesta = async (e) => {
        e.preventDefault();
        try { 
            await authAxios.post('/encuestas', nuevaEncuesta); 
            setNuevaEncuesta({ pregunta: '', opcion1: '', opcion2: '', opcion3: '', opcion4: '' }); 
            cargarTodo(); 
        } catch (error) {
            alert("Error al crear la encuesta");
        }
    };

    const handleBorrarEncuesta = async (id) => {
        if (!window.confirm("¿Seguro que quieres borrar esta encuesta de forma permanente?")) return;
        try { 
            await authAxios.delete(`/encuestas/${id}`); 
            cargarTodo(); 
        } catch (e) {
            alert("Error al borrar la encuesta");
        }
    };

    const handleVotar = async (opcionNumero) => {
        try { 
            await authAxios.post(`/encuestas/${encuestaData.encuesta.id}/votar`, { opcion: opcionNumero }); 
            cargarTodo(); 
        } catch (error) { 
            alert(error.response?.data?.message || "Error al registrar el voto"); 
        }
    };

    const getVotos = (num) => {
        if (!encuestaData || !encuestaData.conteos) return 0;
        const c = encuestaData.conteos.find(x => x.opcion_seleccionada === num);
        return c ? c.total : 0;
    };

    const handleGuardarAviso = async () => {
        try { 
            await authAxios.put(`/avisos_globales/${ultimoAviso.id}`, { mensaje: textoAvisoEditado }); 
            setEditandoAviso(false); 
            cargarTodo(); 
        } catch (error) { 
            alert("Error al editar el aviso global"); 
        }
    };

    const handleBorrarAviso = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar este anuncio de la pantalla principal?")) return;
        try { 
            await authAxios.delete(`/avisos_globales/${ultimoAviso.id}`); 
            cargarTodo(); 
        } catch (error) { 
            alert("Error al borrar el aviso"); 
        }
    };

    // Función reescrita para que el diseño no se rompa nunca
    const renderSlot = (tipo, slotName, tituloSeccion) => {
        const slotData = destacados.slots.find(s => s.slot === slotName);
        const listaOpciones = tipo === 'cancion' ? destacados.canciones : destacados.albumes;
        const itemSeleccionado = listaOpciones.find(i => i.id === slotData?.item_id);

        return (
            <div className="item-card" style={{ background: '#111', display: 'flex', flexDirection: 'column', height: '100%', padding: '0', border: '2px solid var(--highlight-color)' }}>
                
                {/* CABECERA (TOP 1, RECOMENDADO, etc) */}
                <div style={{ padding: '15px', borderBottom: '1px solid #333', background: '#0a0a0a', textAlign: 'center' }}>
                    <h4 style={{ margin: 0, color: '#aaa', fontSize: '1.1em', letterSpacing: '1px' }}>
                        {tituloSeccion}
                    </h4>
                </div>

                {/* CONTENIDO DE LA CANCIÓN / ÁLBUM (Empuja el select hacia abajo) */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center' }}>
                    {itemSeleccionado ? (
                        <>
                            <img 
                                src={itemSeleccionado.imagen_url || `/img/${tipo}_${itemSeleccionado.id}.jpg`} 
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = '/img/placeholder.png'; 
                                }}
                                alt={`Portada de ${itemSeleccionado.titulo}`}
                                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', marginBottom: '15px' }}
                            />
                            <h3 style={{ margin: '0 0 5px 0', textAlign: 'center', fontSize: '1.4em', color: '#fff' }}>{itemSeleccionado.titulo}</h3>
                            <p style={{ margin: 0, color: '#888', textAlign: 'center' }}>{tipo === 'cancion' ? itemSeleccionado.artista : itemSeleccionado.descripcion}</p>
                        </>
                    ) : (
                        <div style={{ width: '100%', height: '200px', background: '#1a1a1a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', border: '1px dashed #444' }}>
                            <p style={{ color: '#555', fontStyle: 'italic', margin: 0 }}>Espacio Disponible</p>
                        </div>
                    )}
                </div>

                {/* SELECT DE ADMIN (Siempre al final, alineado) */}
                {userRol === 'admin' && (
                    <div style={{ padding: '15px', background: '#050505', borderTop: '1px solid #333', marginTop: 'auto' }}>
                        <select 
                            value={slotData?.item_id || ''} 
                            onChange={(e) => handleActualizarSlot(slotName, e.target.value)} 
                            style={{ margin: 0, width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid var(--highlight-color)', borderRadius: '4px', cursor: 'pointer', outline: 'none' }}
                        >
                            <option value="">-- Cambiar {tipo} --</option>
                            {listaOpciones.map(op => <option key={op.id} value={op.id}>{op.titulo}</option>)}
                        </select>
                    </div>
                )}
            </div>
        )
    };

    return (
        <section className="animate-fade-in section active" style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative' }}>
            
            {/* MODAL DEL AVISO POP-UP */}
            {modalAvisoAbierto && ultimoAviso && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: '#111', border: '3px solid var(--highlight-color)', borderRadius: '8px', width: '90%', maxWidth: '500px', padding: '30px', textAlign: 'center' }}>
                        <h2 style={{ color: 'var(--highlight-color)', fontSize: '2em', margin: '0 0 20px 0' }}>📢 COMUNICADO OFICIAL</h2>
                        <p style={{ fontSize: '1.2em', color: '#fff', marginBottom: '20px' }}>{ultimoAviso.mensaje}</p>
                        <p style={{ color: '#888', fontStyle: 'italic', marginBottom: '30px' }}>Por: @{ultimoAviso.autor}</p>
                        <button onClick={() => setModalAvisoAbierto(false)} className="btn-primary" style={{ margin: '0 auto' }}>ENTENDIDO</button>
                    </div>
                </div>
            )}

            {/* 1. BANNER TOP */}
            <div style={{ position: 'relative', width: '100%', height: '300px', backgroundImage: "url('/img/141109487eecf71695ce3d30be6977ca.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '0 0 8px 8px', filter: 'brightness(0.7)' }}>
            </div>

            {/* 2. CANCIONES Y ÁLBUMES (USANDO LAS CLASES DE GRID) */}
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <div>
                    <h2 style={{ borderBottom: '2px solid var(--highlight-color)', paddingBottom: '10px', marginBottom: '20px' }}>🎵 Canciones Destacadas</h2>
                    
                    {/* AQUÍ APLICAMOS LA CLASE PARA QUE SEAN 3 COLUMNAS */}
                    <div className="home-grid-3">
                        {renderSlot('cancion', 'cancion1', 'TOP 1')}
                        {renderSlot('cancion', 'cancion2', 'TOP 2')}
                        {renderSlot('cancion', 'cancion3', 'TOP 3')}
                    </div>
                </div>

                <div>
                    <h2 style={{ borderBottom: '2px solid var(--highlight-color)', paddingBottom: '10px', marginBottom: '20px' }}>💿 Álbumes de la Semana</h2>
                    
                    {/* AQUÍ APLICAMOS LA CLASE PARA QUE SEAN 2 COLUMNAS */}
                    <div className="home-grid-2">
                        {renderSlot('album', 'album1', 'RECOMENDADO')}
                        {renderSlot('album', 'album2', 'CLÁSICO')}
                    </div>
                </div>
            </div>

            {/* 3. ENCUESTA */}
            <div style={{ padding: '0 20px', marginTop: '10px' }}>
                <div style={{ background: '#111', border: '3px solid #333', borderRadius: '8px', padding: '30px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                        <h2 style={{ margin: 0, color: '#fff', fontSize: '2.5em', fontStyle: 'italic', textShadow: '2px 2px 0 var(--highlight-color)' }}>
                            <span style={{ fontSize: '1.5em', color: 'var(--highlight-color)', fontWeight: '900' }}>Q.</span> {encuestaData ? encuestaData.encuesta.pregunta : 'CREAR ENCUESTA'}
                        </h2>
                        {userRol === 'admin' && encuestaData && (
                            <button onClick={() => handleBorrarEncuesta(encuestaData.encuesta.id)} className="btn-delete" style={{ position: 'relative', zIndex: 10 }}>🗑️</button>
                        )}
                    </div>

                    {!encuestaData ? (
                        userRol === 'admin' ? (
                            <form onSubmit={handleCrearEncuesta} style={{ display: 'grid', gap: '10px', position: 'relative', zIndex: 10 }}>
                                <input type="text" className="form-input" placeholder="Pregunta principal de la encuesta" value={nuevaEncuesta.pregunta} onChange={e=>setNuevaEncuesta({...nuevaEncuesta, pregunta: e.target.value})} required />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input type="text" className="form-input" placeholder="Opción 1" value={nuevaEncuesta.opcion1} onChange={e=>setNuevaEncuesta({...nuevaEncuesta, opcion1: e.target.value})} required />
                                    <input type="text" className="form-input" placeholder="Opción 2" value={nuevaEncuesta.opcion2} onChange={e=>setNuevaEncuesta({...nuevaEncuesta, opcion2: e.target.value})} required />
                                    <input type="text" className="form-input" placeholder="Opción 3 (Opcional)" value={nuevaEncuesta.opcion3} onChange={e=>setNuevaEncuesta({...nuevaEncuesta, opcion3: e.target.value})} />
                                    <input type="text" className="form-input" placeholder="Opción 4 (Opcional)" value={nuevaEncuesta.opcion4} onChange={e=>setNuevaEncuesta({...nuevaEncuesta, opcion4: e.target.value})} />
                                </div>
                                <button type="submit" className="btn-add">PUBLICAR ENCUESTA</button>
                            </form>
                        ) : (
                            <p>Cargando red...</p>
                        )
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[1, 2, 3, 4].map(num => {
                                const textoOpcion = encuestaData.encuesta[`opcion${num}`];
                                if (!textoOpcion) return null; 
                                
                                const totalVotos = [1, 2, 3, 4].reduce((acc, n) => acc + getVotos(n), 0);
                                const votosOpcion = getVotos(num);
                                const porcentaje = totalVotos === 0 ? 0 : (votosOpcion / totalVotos) * 100;
                                const yaVoteAqui = encuestaData.yaVote === num;

                                return (
                                    <div 
                                        key={num} 
                                        onClick={() => !encuestaData.yaVote && handleVotar(num)} 
                                        style={{ display: 'flex', alignItems: 'center', cursor: encuestaData.yaVote ? 'default' : 'pointer', transition: 'transform 0.2s', opacity: encuestaData.yaVote && !yaVoteAqui ? 0.5 : 1 }} 
                                        onMouseEnter={(e) => !encuestaData.yaVote && (e.currentTarget.style.transform = 'scale(1.02)')} 
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <div style={{ width: '150px', color: '#fff', fontSize: '1.2em', fontWeight: 'bold', textTransform: 'uppercase', transform: 'skewX(-10deg)', background: 'rgba(0,0,0,0.8)', padding: '10px', borderLeft: '4px solid #e60012', zIndex: 2 }}>
                                            {textoOpcion}
                                        </div>
                                        <div style={{ flexGrow: 1, height: '40px', background: '#000', border: '4px solid #fff', margin: '0 10px', transform: 'skewX(-15deg)', position: 'relative', overflow: 'hidden', boxShadow: '5px 5px 0 rgba(0,0,0,0.5)' }}>
                                            <div style={{ width: `${porcentaje}%`, height: '100%', background: '#e60012', transition: 'width 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}></div>
                                        </div>
                                        <div style={{ width: '140px', textAlign: 'right' }}>
                                            <span style={{ color: '#e60012', fontSize: '3em', fontWeight: '900', fontFamily: 'Impact, sans-serif', textShadow: '2px 2px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 4px 4px 0 #000', display: 'inline-block', transform: 'rotate(-4deg)' }}>
                                                {porcentaje.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* 4. AVISO GLOBAL DE ADMINS */}
            {ultimoAviso && (
                <div style={{ padding: '0 20px', marginTop: '20px' }}>
                    <div style={{ background: '#260a0a', border: '2px dashed var(--highlight-color)', borderRadius: '8px', padding: '20px', position: 'relative' }}>
                        
                        {userRol === 'admin' && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => { setEditandoAviso(!editandoAviso); setTextoAvisoEditado(ultimoAviso.mensaje); }} style={{ background: '#333', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>✏️</button>
                                <button onClick={handleBorrarAviso} style={{ background: 'red', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>🗑️</button>
                            </div>
                        )}

                        <h3 style={{ color: 'var(--highlight-color)', margin: '0 0 10px 0' }}>📢 Aviso Importante</h3>
                        
                        {editandoAviso && userRol === 'admin' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <textarea value={textoAvisoEditado} onChange={e => setTextoAvisoEditado(e.target.value)} className="form-input" style={{ minHeight: '80px' }} />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={handleGuardarAviso} className="btn-add">Guardar Cambios</button>
                                    <button onClick={() => setEditandoAviso(false)} className="btn-secondary">Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => setModalAvisoAbierto(true)} style={{ cursor: 'pointer' }}>
                                <p style={{ color: '#fff', fontSize: '1.1em', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {ultimoAviso.mensaje}
                                </p>
                                <span style={{ color: '#aaa', fontSize: '0.8em', display: 'block', marginTop: '10px' }}>Haz clic para leer el comunicado completo...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 5. BANNER BOTTOM */}
            <div style={{ position: 'relative', width: '100%', height: '200px', backgroundImage: "url('/img/141109487eecf71695ce3d30be6977ca.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', marginTop: '20px', filter: 'brightness(0.7)' }}>
            </div>
            
        </section>
    );
}

export default Inicio;
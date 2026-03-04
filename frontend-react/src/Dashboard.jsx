import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importación de todos tus componentes
import Inicio from './Inicio';
import QuienesSomos from './QuienesSomos';
import Canciones from './Canciones';
import Foros from './Foros';
import Sugerencias from './Sugerencias';
import Albumes from './Albumes';
import Eventos from './Eventos';
import Perfil from './Perfil';
import Fans from './Fans';
import AvisosAdmin from './AvisosAdmin';

import './Css/styles.css';

function Dashboard() {
  const navigate = useNavigate();
  
  // Estados de navegación
  const [activeSection, setActiveSection] = useState('inicio');
  const [perfilAVisualizar, setPerfilAVisualizar] = useState(null); 
  
  // Estados para notificaciones
  const [notificaciones, setNotificaciones] = useState([]); 
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  // Estados del usuario
  const [currentUser, setCurrentUser] = useState('');
  const [userRol, setUserRol] = useState('');

  const token = localStorage.getItem('token');
  const authAxios = axios.create({ 
      baseURL: 'http://localhost:3000/api', 
      headers: { Authorization: `Bearer ${token}` } 
  });

  useEffect(() => {
    // Redirigir al login si no hay token
    if (!token) { 
        navigate('/'); 
        return; 
    }
    
    // Cargar datos de la sesión actual
    setCurrentUser(localStorage.getItem('currentUser')?.toUpperCase() || '');
    setUserRol(localStorage.getItem('userRol') || 'fan');

    // Polling de notificaciones (cada 5 segundos)
    const revisarNotificaciones = async () => {
        try { 
            const res = await authAxios.get('/notificaciones'); 
            setNotificaciones(res.data); 
        } catch (error) { 
            console.error("Error al cargar notificaciones"); 
        }
    };
    
    revisarNotificaciones();
    const intervalo = setInterval(revisarNotificaciones, 5000);
    
    return () => clearInterval(intervalo);
  }, [navigate, token]);

  const handleLogout = () => { 
      localStorage.clear(); 
      navigate('/'); 
  };
  
  const irAPerfil = (username) => { 
      setPerfilAVisualizar(username); 
      setActiveSection('perfil'); 
  };

  const procesarNotificacion = async (notif) => {
      // Remover visualmente la notificación al instante
      setNotificaciones(prev => prev.filter(n => n.id !== notif.id));
      setMostrarNotificaciones(false); 
      
      if (notif.tipo === 'mensaje') {
          try { 
              await authAxios.put(`/mensajes/marcar_leidos/${notif.remitente_id}`); 
          } catch(e) {}
          setActiveSection('fans'); 
      } else {
          try { 
              await authAxios.put(`/notificaciones/${notif.id}/leido`); 
          } catch(e) {}
          
          if (notif.tipo === 'seguidor') {
              irAPerfil(notif.remitente_username); 
          } else if (notif.tipo === 'aviso') {
              alert(`📢 AVISO OFICIAL DE @${notif.remitente_username}:\n\n${notif.mensaje}`);
          }
      }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
                src="/img/PDG.jpeg" 
                alt="Logo PDG" 
                style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--highlight-color)', boxShadow: '0 0 10px var(--highlight-color)' }} 
            />
            <h1 className="navbar-title">PALOMAS DEL GOBIERNO</h1>
          </div>
          
          <div className="navbar-user" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
                <div style={{ cursor: 'pointer', transition: '0.3s' }} onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}>
                    <span style={{ fontSize: '1.5em' }}>🔔</span>
                    {notificaciones.length > 0 && (
                        <span style={{ position: 'absolute', top: '-5px', right: '-10px', background: 'var(--highlight-color)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7em', fontWeight: 'bold', boxShadow: '0 0 5px red' }}>
                            {notificaciones.length}
                        </span>
                    )}
                </div>

                {mostrarNotificaciones && (
                    <div className="animate-fade-in" style={{ position: 'absolute', top: '50px', right: '0', width: '320px', background: 'rgba(20,20,20,0.95)', backdropFilter: 'blur(10px)', border: '1px solid #444', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.8)', zIndex: 9999, overflow: 'hidden' }}>
                        <div style={{ padding: '10px 15px', background: '#111', borderBottom: '1px solid var(--highlight-color)', fontWeight: 'bold', color: 'var(--highlight-color)' }}>
                            Notificaciones Recientes
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {notificaciones.length === 0 ? (
                                <p style={{ padding: '15px', textAlign: 'center', margin: 0, color: '#888', fontSize: '0.9em' }}>Todo al día.</p>
                            ) : (
                                notificaciones.map(n => (
                                    <div key={n.id} onClick={() => procesarNotificacion(n)} style={{ padding: '12px 15px', borderBottom: '1px solid #333', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', gap: '10px', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.background = '#333'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <div style={{ fontSize: '1.5em' }}>{n.tipo === 'mensaje' ? '💬' : n.tipo === 'seguidor' ? '👤' : '📢'}</div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.9em', color: '#fff', lineHeight: '1.3' }}>{n.mensaje}</p>
                                            <span style={{ fontSize: '0.7em', color: '#888' }}>{new Date(n.fecha_creacion).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                👤 {currentUser} <small style={{color: 'var(--highlight-color)'}}>({userRol})</small>
            </span>
            <button className="btn-secondary" onClick={handleLogout} style={{ border: '1px solid var(--highlight-color)', color: 'var(--highlight-color)' }}>
                SALIR
            </button>
          </div>
        </div>
      </nav>

      <div className="main-container">
        <aside className="sidebar">
          <div className="sidebar-menu">
            <button className={`menu-btn ${activeSection === 'inicio' ? 'active' : ''}`} onClick={() => setActiveSection('inicio')}>🏠 INICIO</button>
            <button className={`menu-btn ${activeSection === 'quienessomos' ? 'active' : ''}`} onClick={() => setActiveSection('quienessomos')}>🎸 QUIÉNES SOMOS</button>
            <button className={`menu-btn ${activeSection === 'canciones' ? 'active' : ''}`} onClick={() => setActiveSection('canciones')}>🎵 CANCIONES</button>
            <button className={`menu-btn ${activeSection === 'tareas' ? 'active' : ''}`} onClick={() => setActiveSection('tareas')}>💿 ALBUMES</button>
            <button className={`menu-btn ${activeSection === 'eventos' ? 'active' : ''}`} onClick={() => setActiveSection('eventos')}>📅 EVENTOS</button>
            <button className={`menu-btn ${activeSection === 'foros' ? 'active' : ''}`} onClick={() => setActiveSection('foros')}>🗣️ FOROS</button>
            <button className={`menu-btn ${activeSection === 'sugerencias' ? 'active' : ''}`} onClick={() => setActiveSection('sugerencias')}>💡 SUGERENCIAS</button>
            <button className={`menu-btn ${activeSection === 'fans' ? 'active' : ''}`} onClick={() => setActiveSection('fans')}>👥 CHAT / FANS</button>
            
            {userRol === 'admin' && (
                <button className={`menu-btn ${activeSection === 'avisos' ? 'active' : ''}`} onClick={() => setActiveSection('avisos')} style={{ color: 'var(--highlight-color)', fontWeight: 'bold', border: '1px dashed var(--highlight-color)', marginTop: '10px' }}>
                    📢 AVISOS GLOBALES
                </button>
            )}
            
            <button className={`menu-btn ${activeSection === 'perfil' && !perfilAVisualizar ? 'active' : ''}`} onClick={() => { setActiveSection('perfil'); setPerfilAVisualizar(null); }} style={{ borderTop: '1px solid #333', marginTop: 'auto', paddingTop: '15px' }}>
              👤 MI PERFIL
            </button>
          </div>
        </aside>

        <main className="content" onClick={() => setMostrarNotificaciones(false)}>
          {activeSection === 'inicio' && <Inicio userRol={userRol} />}
          {activeSection === 'quienessomos' && <QuienesSomos />}
          {activeSection === 'canciones' && <Canciones userRol={userRol} irAPerfil={irAPerfil} />}
          {activeSection === 'tareas' && <Albumes userRol={userRol} irAPerfil={irAPerfil} />}
          {activeSection === 'foros' && <Foros userRol={userRol} irAPerfil={irAPerfil} />}
          {activeSection === 'sugerencias' && <Sugerencias userRol={userRol} irAPerfil={irAPerfil} />}
          {activeSection === 'fans' && <Fans irAPerfil={irAPerfil} />}
          {activeSection === 'eventos' && <Eventos userRol={userRol} />}
          {activeSection === 'perfil' && <Perfil targetUsername={perfilAVisualizar} irAPerfil={irAPerfil} />}
          {activeSection === 'avisos' && <AvisosAdmin />}
        </main>
      </div>
    </>
  );
}

export default Dashboard;
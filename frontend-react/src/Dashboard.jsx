import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importación de componentes individuales para una mejor organización
import Canciones from './Canciones';
import Foros from './Foros';
import Albumes from './Albumes';
import Eventos from './Eventos';
import Perfil from './perfil';

import './Css/styles.css';

function Dashboard() {
  const navigate = useNavigate();
  
  // Estado para controlar la sección activa en el panel central
  const [activeSection, setActiveSection] = useState('canciones');
  
  // Estados para la información del usuario en sesión
  const [currentUser, setCurrentUser] = useState('');
  const [userRol, setUserRol] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Redirigir al login si no existe un token de sesión
    if (!token) {
      navigate('/');
      return;
    }
    // Recuperar datos del usuario guardados durante el login
    setCurrentUser(localStorage.getItem('currentUser')?.toUpperCase() || '');
    setUserRol(localStorage.getItem('userRol') || 'fan');
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <nav className="navbar">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
              src="/img/PDG.jpeg" 
              alt="Logo PDG" 
              style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #ff0000' }} 
            />
            <h1 className="navbar-title">PALOMAS DEL GOBIERNO</h1>
          </div>
          <div className="navbar-user">
            <span id="userDisplay">👤 {currentUser} <small>({userRol})</small></span>
            <button id="logoutBtn" className="btn-logout" onClick={handleLogout}>SALIR</button>
          </div>
        </div>
      </nav>

      {/* CONTENEDOR PRINCIPAL: SIDEBAR + CONTENIDO */}
      <div className="main-container">
        
        {/* MENÚ LATERAL (SIDEBAR) */}
        <aside className="sidebar">
          <div className="sidebar-menu">
            <button 
              className={`menu-btn ${activeSection === 'canciones' ? 'active' : ''}`} 
              onClick={() => setActiveSection('canciones')}
            >
              🎵 CANCIONES
            </button>
            <button 
              className={`menu-btn ${activeSection === 'foros' ? 'active' : ''}`} 
              onClick={() => setActiveSection('foros')}
            >
              🗣️ FOROS
            </button>
            <button 
              className={`menu-btn ${activeSection === 'tareas' ? 'active' : ''}`} 
              onClick={() => setActiveSection('tareas')}
            >
              💿 ALBUMES
            </button>
            <button 
              className={`menu-btn ${activeSection === 'eventos' ? 'active' : ''}`} 
              onClick={() => setActiveSection('eventos')}
            >
              📅 EVENTOS
            </button>
            
            {/* SECCIÓN DE PERFIL PERSONAL */}
            <button 
              className={`menu-btn ${activeSection === 'perfil' ? 'active' : ''}`} 
              onClick={() => setActiveSection('perfil')}
              style={{ borderTop: '1px solid #333', marginTop: '10px', paddingTop: '10px' }}
            >
              👤 MI PERFIL
            </button>
          </div>
        </aside>

        {/* ÁREA DE CONTENIDO DINÁMICO */}
        <main className="content">
          {/* Renderizado condicional basado en la sección activa */}
          {activeSection === 'canciones' && <Canciones userRol={userRol} />}
          {activeSection === 'foros' && <Foros userRol={userRol} />}
          {activeSection === 'tareas' && <Albumes userRol={userRol} />}
          {activeSection === 'eventos' && <Eventos userRol={userRol} />}
          {activeSection === 'perfil' && <Perfil />}
        </main>
        
      </div>
    </>
  );
}

export default Dashboard;
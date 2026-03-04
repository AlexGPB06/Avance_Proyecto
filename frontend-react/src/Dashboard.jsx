import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importamos nuestros nuevos componentes limpios y separados
import Canciones from './Canciones';
import Foros from './Foros';
import Albumes from './Albumes';
import Eventos from './Eventos';

import './Css/styles.css';

function Dashboard() {
  const navigate = useNavigate();
  
  // Estado para controlar qué sección está visible en el centro
  const [activeSection, setActiveSection] = useState('canciones');
  
  // Estados de autenticación
  const [currentUser, setCurrentUser] = useState('');
  const [userRol, setUserRol] = useState('');

  const token = localStorage.getItem('token');

  // Verificamos si hay token al entrar a la página
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    // Recuperamos los datos del usuario logueado
    setCurrentUser(localStorage.getItem('currentUser')?.toUpperCase() || '');
    setUserRol(localStorage.getItem('userRol') || 'fan');
  }, [navigate, token]);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      {/* BARRA SUPERIOR (Navbar) */}
      <nav className="navbar">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="/img/PDG.jpeg" alt="PDG" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #ff0000' }} />
            <h1 className="navbar-title">PALOMAS DEL GOBIERNO</h1>
          </div>
          <div className="navbar-user">
            <span id="userDisplay">👤 {currentUser} <small>({userRol})</small></span>
            <button id="logoutBtn" className="btn-logout" onClick={handleLogout}>SALIR</button>
          </div>
        </div>
      </nav>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="main-container">
        
        {/* MENÚ LATERAL (Sidebar) */}
        <aside className="sidebar">
          <div className="sidebar-menu">
            <button className={`menu-btn ${activeSection === 'canciones' ? 'active' : ''}`} onClick={() => setActiveSection('canciones')}>🎵 CANCIONES</button>
            <button className={`menu-btn ${activeSection === 'foros' ? 'active' : ''}`} onClick={() => setActiveSection('foros')}>🗣️ FOROS</button>
            <button className={`menu-btn ${activeSection === 'tareas' ? 'active' : ''}`} onClick={() => setActiveSection('tareas')}>💿 ALBUMES</button>
            <button className={`menu-btn ${activeSection === 'eventos' ? 'active' : ''}`} onClick={() => setActiveSection('eventos')}>📅 EVENTOS</button>
          </div>
        </aside>

        {/* ÁREA CENTRAL DONDE SE DIBUJAN LOS COMPONENTES */}
        <main className="content">
          {activeSection === 'canciones' && <Canciones userRol={userRol} />}
          {activeSection === 'foros' && <Foros userRol={userRol} />}
          {activeSection === 'tareas' && <Albumes userRol={userRol} />}
          {activeSection === 'eventos' && <Eventos userRol={userRol} />}
        </main>
        
      </div>
    </>
  );
}

export default Dashboard;
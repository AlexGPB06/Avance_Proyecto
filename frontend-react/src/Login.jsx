import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Css/Login.css';

const API_URL = 'http://localhost:3000/api';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/login`, {
        username: formData.username,
        password: formData.password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('currentUser', formData.username);
      localStorage.setItem('userRol', res.data.rol); // NUEVO: Guardamos el rol
      navigate('/main');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API_URL}/register`, {
        username: formData.username,
        password: formData.password,
        email: formData.email
      });
      alert('¡Registro exitoso! Ya puedes iniciar sesión.');
      setIsRegistering(false); // Devuelve al usuario a la pantalla de login
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div className="login-container">
      
      {/* TARJETA DE LOGIN */}
      {!isRegistering ? (
        <div className="login-card">
          <div className="login-header">
            <img src="/img/PDG.jpeg" alt="Palomas del Gobierno" />
            <h1>PALOMAS DEL GOBIERNO</h1>
            <p className="tagline">COMUNIDAD DE FANS - ROCK MEXICANO</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">USUARIO</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                placeholder="Ingresa tu usuario" 
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">CONTRASEÑA</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Ingresa tu contraseña" 
                onChange={handleChange}
                required 
              />
            </div>

            <button type="submit" className="btn-login">⚡ INICIAR SESIÓN ⚡</button>
          </form>

          <div className="login-footer">
            <p>
              ¿PRIMERA VEZ? <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); setError(''); }}>CREAR CUENTA</a>
            </p>
          </div>

          {error && <div className="error-message" style={{ display: 'block' }}>{error}</div>}
        </div>
      ) : (

      /* TARJETA DE REGISTRO */
        <div className="register-card">
          <div className="login-header">
            <img src="/img/PDG.jpeg" alt="Palomas del Gobierno" />
            <h1>PALOMAS DEL GOBIERNO</h1>
            <p className="tagline">ÚNETE A LA COMUNIDAD</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="regUsername">USUARIO</label>
              <input 
                type="text" 
                id="regUsername" 
                name="username" 
                placeholder="Crea tu usuario" 
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="regPassword">CONTRASEÑA</label>
              <input 
                type="password" 
                id="regPassword" 
                name="password" 
                placeholder="Crea tu contraseña" 
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="regEmail">EMAIL (OPCIONAL)</label>
              <input 
                type="email" 
                id="regEmail" 
                name="email" 
                placeholder="tu@email.com"
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-login">⚡ REGISTRARSE ⚡</button>
          </form>

          <div className="login-footer">
            <p>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(false); setError(''); }}>VOLVER AL LOGIN</a>
            </p>
          </div>

          {error && <div className="error-message" style={{ display: 'block' }}>{error}</div>}
        </div>
      )}
      
    </div>
  );
}

export default Login;
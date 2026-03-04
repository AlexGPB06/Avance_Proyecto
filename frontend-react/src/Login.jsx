import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Css/Login.css';

const API_URL = 'http://localhost:3000/api';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  // 1. AÑADIMOS fecha_nacimiento Y sexo AL ESTADO INICIAL
  const [formData, setFormData] = useState({ username: '', password: '', email: '', fecha_nacimiento: '', sexo: '' });
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
      localStorage.setItem('userRol', res.data.rol);
      navigate('/main');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 2. ENVIAMOS LOS NUEVOS DATOS AL BACKEND
      await axios.post(`${API_URL}/register`, {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        fecha_nacimiento: formData.fecha_nacimiento,
        sexo: formData.sexo
      });
      alert('¡Registro exitoso! Ya puedes iniciar sesión.');
      setIsRegistering(false); 
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

            {/* 3. NUEVO INPUT: FECHA DE NACIMIENTO */}
            <div className="form-group">
              <label htmlFor="regFechaNacimiento">FECHA DE NACIMIENTO</label>
              <input 
                type="date" 
                id="regFechaNacimiento" 
                name="fecha_nacimiento" 
                onChange={handleChange}
                required 
              />
            </div>

            {/* 4. NUEVO INPUT: SEXO */}
            <div className="form-group">
              <label htmlFor="regSexo">SEXO</label>
              <select 
                id="regSexo" 
                name="sexo" 
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '2px solid #333', color: '#fff', borderRadius: '4px', marginTop: '5px' }}
              >
                <option value="" style={{ color: '#000' }}>Selecciona tu sexo...</option>
                <option value="Masculino" style={{ color: '#000' }}>Masculino</option>
                <option value="Femenino" style={{ color: '#000' }}>Femenino</option>
                <option value="Otro" style={{ color: '#000' }}>Otro</option>
                <option value="Prefiero no decirlo" style={{ color: '#000' }}>Prefiero no decirlo</option>
              </select>
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
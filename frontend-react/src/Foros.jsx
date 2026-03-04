import { useState, useEffect } from 'react';
import axios from 'axios';
import ForoAprobado from './ForoAprobado';

const API_URL = 'http://localhost:3000/api';

function Foros({ userRol }) {
  const [data, setData] = useState([]);
  // Añadimos 'descripcion' al estado inicial
  const [newItem, setNewItem] = useState({ titulo: '', descripcion: '' }); 
  const [foroActivo, setForoActivo] = useState(null); 

  const token = localStorage.getItem('token');
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await authAxios.get('/foros');
      setData(res.data);
    } catch (error) {
      console.error("Error cargando foros", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.titulo.trim() || !newItem.descripcion.trim()) {
        alert("Por favor llena el título y la descripción.");
        return;
    }
    try {
      await authAxios.post('/foros', newItem);
      setNewItem({ titulo: '', descripcion: '' }); // Limpiamos ambos campos
      cargarDatos();
      alert('🗣️ PROPUESTA ENVIADA. Un administrador la revisará pronto.');
    } catch (error) {
      alert('Error al enviar propuesta: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ELIMINAR ESTE TEMA DEL FORO?')) return;
    try {
      await authAxios.delete(`/foros/${id}`);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar: Privilegios insuficientes');
    }
  };

  const handleEstadoForo = async (id, estado) => {
    try {
      await authAxios.put(`/foros/${id}/estado`, { estado });
      cargarDatos();
    } catch (error) {
      alert('Error al cambiar el estado del foro');
    }
  };

  if (foroActivo) {
      return <ForoAprobado foro={foroActivo} onBack={() => setForoActivo(null)} />;
  }

  return (
    <section className="section active">
      <div className="section-header">
        <h2>🗣️ FORO DE DISCUSIÓN</h2>
      </div>

      <div className="form-section">
        <h3>PROPONER NUEVO TEMA</h3>
        <form onSubmit={handleAdd} className="form-group-column">
          <input 
            type="text" 
            name="titulo" 
            placeholder="Título del tema (Ej: ¿Cuál es su álbum favorito?)" 
            className="form-input" 
            value={newItem.titulo} 
            onChange={(e) => setNewItem({ ...newItem, titulo: e.target.value })} 
            required 
          />
          <textarea 
            name="descripcion" 
            placeholder="Escribe el contexto o tu idea principal aquí..." 
            className="form-input" 
            style={{ resize: 'vertical', minHeight: '80px' }}
            value={newItem.descripcion} 
            onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })} 
            required 
          />
          <button type="submit" className="btn-add" style={{ alignSelf: 'flex-start' }}>⚡ ENVIAR PROPUESTA</button>
        </form>
      </div>

      <div className="items-container">
        {data.length === 0 ? <p className="empty-message">No hay temas aún.</p> : (
          data.map((item) => (
            <div key={item.id} className="item-card foro-card">
              <div className="item-header">
                <div>
                  <h3 style={{ marginBottom: '5px' }}>{item.titulo}</h3>
                  {/* Mostramos la descripción truncada o completa en la tarjeta */}
                  <p style={{ color: '#ccc', fontStyle: 'italic', marginBottom: '10px', fontSize: '0.9em' }}>
                    {item.descripcion}
                  </p>
                  
                  {item.estado === 'aprobado' && (
                    <button 
                      className="btn-action" 
                      style={{ background: '#333', color: '#fff', padding: '5px 15px', fontSize: '0.9em', marginTop: '10px', borderRadius: '4px', border: '1px solid var(--highlight-color)', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => setForoActivo(item)}
                    >
                      💬 Entrar a la conversación
                    </button>
                  )}
                </div>
                
                {userRol === 'admin' && (
                  <div>
                    <button type="button" className="btn-delete" onClick={() => handleDelete(item.id)}>🗑️</button>
                  </div>
                )}
              </div>

              <p><strong>AUTOR:</strong> @{item.autor}</p>
              <p><strong>ESTADO:</strong> 
                <span style={{
                  marginLeft: '8px', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8em',
                  background: item.estado === 'aprobado' ? 'green' : item.estado === 'rechazado' ? 'red' : 'orange',
                  color: 'white', fontWeight: 'bold'
                }}>
                  {item.estado?.toUpperCase() || 'PENDIENTE'}
                </span>
              </p>

              {userRol === 'admin' && item.estado === 'pendiente' && (
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEstadoForo(item.id, 'aprobado')} style={{ padding: '8px', background: 'green', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✅ APROBAR</button>
                  <button onClick={() => handleEstadoForo(item.id, 'rechazado')} style={{ padding: '8px', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>❌ RECHAZAR</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Foros;
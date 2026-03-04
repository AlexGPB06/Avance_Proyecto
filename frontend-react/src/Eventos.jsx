import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Eventos({ userRol }) {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ 
      nombre: '', 
      fecha: '', 
      lugar: '' 
  });

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
        const res = await authAxios.get('/eventos'); 
        setData(res.data); 
    } catch (error) { 
        console.error("Error al cargar eventos", error); 
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.nombre.trim() || !newItem.fecha || !newItem.lugar.trim()) {
        alert("Por favor llena todos los campos del evento.");
        return;
    }

    try { 
        await authAxios.post('/eventos', newItem); 
        setNewItem({ nombre: '', fecha: '', lugar: '' }); 
        cargarDatos(); 
        alert("Evento agregado. Pon la imagen en public/img/evento_ID.jpg");
    } catch (error) { 
        alert('Error al agregar el evento'); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ELIMINAR ESTE EVENTO DE LA GIRA?')) return;
    try { 
        await authAxios.delete(`/eventos/${id}`); 
        cargarDatos(); 
    } catch (error) { 
        alert('Error al eliminar el evento'); 
    }
  };

  return (
    <section className="animate-fade-in section active">
      <div className="section-header">
          <h2>📅 PRÓXIMOS CONCIERTOS Y EVENTOS</h2>
      </div>

      {userRol === 'admin' && (
        <div style={{ 
            background: 'rgba(20,20,20,0.8)', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '30px', 
            border: '1px solid var(--highlight-color)' 
        }}>
          <h3 style={{ marginTop: 0, color: 'var(--highlight-color)' }}>
              AGREGAR NUEVO EVENTO (SOLO ADMIN)
          </h3>
          <form 
              onSubmit={handleAdd} 
              style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr auto', 
                  gap: '15px', 
                  alignItems: 'center' 
              }}
          >
            <input 
                type="text" 
                placeholder="Nombre de la Gira/Evento" 
                className="form-input" 
                style={{ margin: 0 }} 
                value={newItem.nombre} 
                onChange={e => setNewItem({...newItem, nombre: e.target.value})} 
                required 
            />
            <input 
                type="datetime-local" 
                className="form-input" 
                style={{ margin: 0 }} 
                value={newItem.fecha} 
                onChange={e => setNewItem({...newItem, fecha: e.target.value})} 
                required 
            />
            <input 
                type="text" 
                placeholder="Lugar / Estadio" 
                className="form-input" 
                style={{ margin: 0 }} 
                value={newItem.lugar} 
                onChange={e => setNewItem({...newItem, lugar: e.target.value})} 
                required 
            />
            <button type="submit" className="btn-primary">
                ➕ AGREGAR
            </button>
          </form>
        </div>
      )}

      <div className="items-grid">
        {data.length === 0 ? (
            <p className="empty-message">Actualmente no hay eventos programados. ¡Pronto anunciaremos fechas!</p>
        ) : (
            data.map((item, idx) => (
                <div 
                    key={item.id} 
                    className="item-card" 
                    style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div style={{ position: 'relative' }}>
                    <img 
                        src={item.imagen_url || `/img/evento_${item.id}.jpg`} 
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = '/img/placeholder.png'; 
                        }}
                        alt="Flyer del Evento" 
                        className="card-image" 
                    />
                    
                    {userRol === 'admin' && (
                        <button 
                            className="btn-delete" 
                            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }} 
                            onClick={() => handleDelete(item.id)}
                        >
                            🗑️
                        </button>
                    )}
                  </div>
                  
                  <div className="card-content">
                    <h3 className="card-title">{item.nombre}</h3>
                    <p className="card-subtitle" style={{ color: 'var(--highlight-color)', fontWeight: 'bold' }}>
                        📅 {new Date(item.fecha).toLocaleString()}
                    </p>
                    <p style={{ margin: 0, color: '#aaa', fontSize: '1.1em' }}>
                        📍 {item.lugar}
                    </p>
                    
                    <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '10px' }}>
                      <button className="btn-secondary" style={{ flexGrow: 1 }}>
                          🎟️ COMPRAR BOLETOS
                      </button>
                    </div>
                  </div>
                </div>
            ))
        )}
      </div>
    </section>
  );
}

export default Eventos;
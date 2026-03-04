import { useState, useEffect } from 'react';
import axios from 'axios';
import InteraccionesModal from './InteraccionesModal';

const API_URL = 'http://localhost:3000/api';

function Canciones({ userRol, irAPerfil }) {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ 
      titulo: '', 
      artista: '', 
      genero: '' 
  });
  const [modalItem, setModalItem] = useState(null);

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
        const res = await authAxios.get('/canciones'); 
        setData(res.data); 
    } catch (error) { 
        console.error("Error al cargar las canciones", error); 
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    if (!newItem.titulo.trim() || !newItem.artista.trim() || !newItem.genero.trim()) {
        alert("Por favor llena todos los campos obligatorios.");
        return;
    }

    try { 
        await authAxios.post('/canciones', newItem); 
        setNewItem({ 
            titulo: '', 
            artista: '', 
            genero: '' 
        }); 
        cargarDatos(); 
        alert("Canción agregada. Para ver su portada, guarda una imagen en la carpeta public/img/ como cancion_ID.jpg");
    } catch (error) { 
        alert('Error al agregar: ' + (error.response?.data?.message || error.message)); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ESTÁS SEGURO DE ELIMINAR ESTA CANCIÓN? Esta acción no se puede deshacer.')) {
        return;
    }

    try { 
        await authAxios.delete(`/canciones/${id}`); 
        cargarDatos(); 
    } catch (error) {
        alert("Error al eliminar la canción.");
    }
  };

  return (
    <section className="animate-fade-in section active">
      <div className="section-header">
          <h2>🎵 DISCOGRAFÍA OFICIAL</h2>
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
              AGREGAR NUEVA CANCIÓN (SOLO ADMIN)
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
                placeholder="Título de la Canción" 
                className="form-input" 
                style={{ margin: 0 }} 
                value={newItem.titulo} 
                onChange={e => setNewItem({...newItem, titulo: e.target.value})} 
                required 
            />
            <input 
                type="text" 
                placeholder="Artista / Banda" 
                className="form-input" 
                style={{ margin: 0 }} 
                value={newItem.artista} 
                onChange={e => setNewItem({...newItem, artista: e.target.value})} 
                required 
            />
            <input 
                type="text" 
                placeholder="Género Musical" 
                className="form-input" 
                style={{ margin: 0 }} 
                value={newItem.genero} 
                onChange={e => setNewItem({...newItem, genero: e.target.value})} 
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
            <p className="empty-message">No hay canciones publicadas aún.</p>
        ) : (
            data.map((item, idx) => (
                <div 
                    key={item.id} 
                    className="item-card" 
                    style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div style={{ position: 'relative' }}>
                    {/* IMAGEN LOCAL (CON PLACEHOLDER DE RESPALDO) */}
                    <img 
                        src={item.imagen_url || `/img/cancion_${item.id}.jpg`} 
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = '/img/placeholder.png'; 
                        }}
                        alt={`Portada de ${item.titulo}`}
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
                    <h3 className="card-title">{item.titulo}</h3>
                    <p className="card-subtitle">{item.artista} • {item.genero}</p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                      <button 
                          className="btn-primary" 
                          style={{ flexGrow: 1 }} 
                          onClick={() => setModalItem(item)}
                      >
                          ⭐ CALIFICAR / 💬 OPINAR
                      </button>
                    </div>
                  </div>
                </div>
            ))
        )}
      </div>
      
      {modalItem && (
          <InteraccionesModal 
              item={modalItem} 
              tipoEntidad="cancion" 
              onClose={() => setModalItem(null)} 
              irAPerfil={irAPerfil} 
          />
      )}
    </section>
  );
}

export default Canciones;
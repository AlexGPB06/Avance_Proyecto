import { useState, useEffect } from 'react';
import axios from 'axios';
import InteraccionesModal from './InteraccionesModal';

const API_URL = 'http://localhost:3000/api';

function Albumes({ userRol, irAPerfil }) {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ 
      titulo: '', 
      descripcion: '', 
      prioridad: 'Alta' 
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
        const res = await authAxios.get('/tareas'); 
        setData(res.data); 
    } catch (error) {
        console.error("Error al cargar los álbumes", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.titulo.trim() || !newItem.descripcion.trim()) {
        alert("Por favor llena los campos obligatorios.");
        return;
    }

    try { 
        await authAxios.post('/tareas', newItem); 
        setNewItem({ 
            titulo: '', 
            descripcion: '', 
            prioridad: 'Alta' 
        }); 
        cargarDatos(); 
        alert("Álbum agregado. Para ver su portada, guarda una foto en public/img/ como album_ID.jpg");
    } catch (error) { 
        alert('Error al agregar: ' + (error.response?.data?.message || error.message)); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ESTÁS SEGURO DE ELIMINAR ESTE ÁLBUM?')) {
        return;
    }

    try { 
        await authAxios.delete(`/tareas/${id}`); 
        cargarDatos(); 
    } catch (error) {
        alert("Error al eliminar el álbum.");
    }
  };

  return (
    <section className="animate-fade-in section active">
      <div className="section-header">
          <h2>💿 NUESTROS ÁLBUMES</h2>
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
              AGREGAR NUEVO ÁLBUM (SOLO ADMIN)
          </h3>
          <form 
              onSubmit={handleAdd} 
              style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 2fr auto', 
                  gap: '15px', 
                  alignItems: 'center' 
              }}
          >
            <input 
                type="text" 
                placeholder="Nombre del Álbum *" 
                className="form-input" 
                style={{ margin: 0 }} 
                value={newItem.titulo} 
                onChange={e => setNewItem({...newItem, titulo: e.target.value})} 
                required 
            />
            <input 
                type="text" 
                placeholder="Descripción breve *" 
                className="form-input" 
                style={{ margin: 0 }} 
                value={newItem.descripcion} 
                onChange={e => setNewItem({...newItem, descripcion: e.target.value})} 
                required 
            />
            <button 
                type="submit" 
                className="btn-primary" 
            >
                ➕ PUBLICAR ÁLBUM
            </button>
          </form>
        </div>
      )}

      <div className="items-grid">
        {data.length === 0 ? (
            <p className="empty-message">No hay álbumes publicados aún.</p>
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
                        src={item.imagen_url || `/img/album_${item.id}.jpg`} 
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = '/img/placeholder.png'; 
                        }}
                        alt={`Portada de ${item.titulo}`} 
                        className="card-image" 
                        style={{ height: '250px' }} 
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
                    <p className="card-subtitle" style={{ color: '#ccc', textTransform: 'none' }}>
                        {item.descripcion}
                    </p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', paddingTop: '15px' }}>
                      <button 
                          className="btn-primary" 
                          style={{ flexGrow: 1 }} 
                          onClick={() => setModalItem(item)}
                      >
                          ⭐ CALIFICAR / 💬 RESEÑAS
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
              tipoEntidad="tarea" 
              onClose={() => setModalItem(null)} 
              irAPerfil={irAPerfil} 
          />
      )}
    </section>
  );
}

export default Albumes;
import { useState, useEffect } from 'react';
import axios from 'axios';
import InteraccionesModal from './InteraccionesModal';

const API_URL = 'http://localhost:3000/api';

function Albumes({ userRol }) {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ titulo: '', descripcion: '', prioridad: 'baja' });
  const [editingItem, setEditingItem] = useState(null);
  const [itemInteraccion, setItemInteraccion] = useState(null);

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
      const res = await authAxios.get('/tareas'); // En el backend son "tareas"
      setData(res.data);
    } catch (error) {
      console.error("Error cargando álbumes", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await authAxios.post('/tareas', newItem);
      setNewItem({ titulo: '', descripcion: '', prioridad: 'baja' });
      cargarDatos();
      alert('⚡ ÁLBUM AGREGADO CON ÉXITO');
    } catch (error) {
      alert('Error al agregar el álbum');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ELIMINAR ESTE ÁLBUM?')) return;
    try {
      await authAxios.delete(`/tareas/${id}`);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar: Privilegios insuficientes');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await authAxios.put(`/tareas/editar/${editingItem.id}`, editingItem);
      setEditingItem(null);
      cargarDatos();
      alert('💾 CAMBIOS GUARDADOS');
    } catch (error) {
      alert('Error al editar: Privilegios insuficientes');
    }
  };

  const toggleTarea = async (tarea) => {
    if (userRol !== 'admin') return; 
    try {
      await authAxios.put(`/tareas/${tarea.id}`, { completada: !tarea.completada });
      cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="section active">
      <div className="section-header">
        <h2>💿 ÁLBUMES COMPLETADOS</h2>
      </div>

      {userRol === 'admin' && (
        <div className="form-section">
          <h3>AGREGAR ÁLBUM</h3>
          <form onSubmit={handleAdd} className="form-group-row">
            <input type="text" name="titulo" placeholder="Título del Álbum" className="form-input" value={newItem.titulo} onChange={(e) => setNewItem({...newItem, titulo: e.target.value})} required />
            <input type="text" name="descripcion" placeholder="Descripción / Reseña" className="form-input" value={newItem.descripcion} onChange={(e) => setNewItem({...newItem, descripcion: e.target.value})} />
            <select name="prioridad" className="form-input" value={newItem.prioridad} onChange={(e) => setNewItem({...newItem, prioridad: e.target.value})}>
              <option value="baja">🟢 COMPLETADO</option>
              <option value="media">🟡 A MEDIAS</option>
              <option value="alta">🔴 SIN ESCUCHAR</option>
            </select>
            <button type="submit" className="btn-add">⚡ AGREGAR</button>
          </form>
        </div>
      )}

      <div className="items-container">
        {data.length === 0 ? <p className="empty-message">No hay registros aún.</p> : (
          data.map((item) => (
            <div key={item.id} className={`item-card tarea-card ${item.completada ? 'completada' : ''}`}>
              <div className="item-header">
                <div>
                  <h3>
                    <input 
                      type="checkbox" 
                      checked={!!item.completada} 
                      onChange={() => toggleTarea(item)} 
                      style={{marginRight: '10px'}} 
                      disabled={userRol !== 'admin'} 
                    />
                    {item.titulo}
                  </h3>
                  <button 
                    className="btn-action" 
                    style={{ background: '#333', color: '#fff', padding: '5px 10px', fontSize: '0.8em', marginTop: '5px', borderRadius: '4px', border: '1px solid var(--highlight-color)' }}
                    onClick={() => setItemInteraccion(item)}
                  >
                    💬 Ver Comunidad
                  </button>
                </div>
                
                {userRol === 'admin' && (
                  <div>
                    <button type="button" className="btn-edit" onClick={() => setEditingItem(item)}>✏️</button>
                    <button type="button" className="btn-delete" onClick={() => handleDelete(item.id)}>🗑️</button>
                  </div>
                )}
              </div>
              <div className="tarea-footer">
                <p>{item.descripcion}</p>
                <span className={`prioridad-${item.prioridad}`}>{item.prioridad?.toUpperCase()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingItem && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ MODIFICAR ÁLBUM</h2>
              <span className="close-btn" onClick={() => setEditingItem(null)}>&times;</span>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-group-column">
                <input type="text" className="form-input" value={editingItem.titulo} onChange={(e) => setEditingItem({...editingItem, titulo: e.target.value})} required />
                <input type="text" className="form-input" value={editingItem.descripcion} onChange={(e) => setEditingItem({...editingItem, descripcion: e.target.value})} />
                <select className="form-input" value={editingItem.prioridad} onChange={(e) => setEditingItem({...editingItem, prioridad: e.target.value})}>
                  <option value="baja">🟢 COMPLETADO</option>
                  <option value="media">🟡 A MEDIAS</option>
                  <option value="alta">🔴 SIN ESCUCHAR</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setEditingItem(null)}>CANCELAR</button>
                <button type="submit" className="btn-save">💾 GUARDAR CAMBIOS</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE COMUNIDAD */}
      {itemInteraccion && (
        <InteraccionesModal item={itemInteraccion} tipoEntidad="tarea" onClose={() => setItemInteraccion(null)} />
      )}
    </section>
  );
}

export default Albumes;
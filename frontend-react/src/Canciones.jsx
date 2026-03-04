import { useState, useEffect } from 'react';
import axios from 'axios';
import InteraccionesModal from './InteraccionesModal';

const API_URL = 'http://localhost:3000/api';

function Canciones({ userRol }) {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ titulo: '', artista: '', genero: '' });
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
      const res = await authAxios.get('/canciones');
      setData(res.data);
    } catch (error) {
      console.error("Error cargando canciones", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await authAxios.post('/canciones', newItem);
      setNewItem({ titulo: '', artista: '', genero: '' });
      cargarDatos();
      alert('⚡ CANCIÓN AGREGADA CON ÉXITO');
    } catch (error) {
      alert('Error al agregar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ELIMINAR ESTA CANCIÓN?')) return;
    try {
      await authAxios.delete(`/canciones/${id}`);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar: Privilegios insuficientes');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await authAxios.put(`/canciones/${editingItem.id}`, editingItem);
      setEditingItem(null);
      cargarDatos();
      alert('💾 CAMBIOS GUARDADOS');
    } catch (error) {
      alert('Error al editar: Privilegios insuficientes');
    }
  };

  return (
    <section className="section active">
      <div className="section-header">
        <h2>🎵 CANCIONES FAVORITAS</h2>
      </div>

      {userRol === 'admin' && (
        <div className="form-section">
          <h3>AGREGAR NUEVA CANCIÓN</h3>
          <form onSubmit={handleAdd} className="form-group-row">
            <input type="text" name="titulo" placeholder="Título" className="form-input" value={newItem.titulo} onChange={(e) => setNewItem({...newItem, titulo: e.target.value})} required />
            <input type="text" name="artista" placeholder="Artista" className="form-input" value={newItem.artista} onChange={(e) => setNewItem({...newItem, artista: e.target.value})} required />
            <input type="text" name="genero" placeholder="Género" className="form-input" value={newItem.genero} onChange={(e) => setNewItem({...newItem, genero: e.target.value})} />
            <button type="submit" className="btn-add">⚡ AGREGAR</button>
          </form>
        </div>
      )}

      <div className="items-container">
        {data.length === 0 ? <p className="empty-message">No hay registros aún.</p> : (
          data.map((item) => (
            <div key={item.id} className="item-card cancion-card">
              <div className="item-header">
                <div>
                  <h3>{item.titulo}</h3>
                  <button className="btn-action" style={{ background: '#333', color: '#fff', padding: '5px 10px', fontSize: '0.8em', marginTop: '5px', borderRadius: '4px', border: '1px solid var(--highlight-color)' }} onClick={() => setItemInteraccion(item)}>
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
              <p><strong>ARTISTA:</strong> {item.artista}</p>
              <p><strong>GÉNERO:</strong> {item.genero}</p>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingItem && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ MODIFICAR CANCIÓN</h2>
              <span className="close-btn" onClick={() => setEditingItem(null)}>&times;</span>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-group-column">
                <input type="text" className="form-input" value={editingItem.titulo} onChange={(e) => setEditingItem({...editingItem, titulo: e.target.value})} required />
                <input type="text" className="form-input" value={editingItem.artista} onChange={(e) => setEditingItem({...editingItem, artista: e.target.value})} required />
                <input type="text" className="form-input" value={editingItem.genero} onChange={(e) => setEditingItem({...editingItem, genero: e.target.value})} />
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
        <InteraccionesModal item={itemInteraccion} tipoEntidad="cancion" onClose={() => setItemInteraccion(null)} />
      )}
    </section>
  );
}

export default Canciones;
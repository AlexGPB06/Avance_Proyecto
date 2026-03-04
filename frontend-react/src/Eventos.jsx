import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Eventos({ userRol }) {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ nombre: '', fecha: '', lugar: '' });
  const [editingItem, setEditingItem] = useState(null);

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
      console.error("Error cargando eventos", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await authAxios.post('/eventos', newItem);
      setNewItem({ nombre: '', fecha: '', lugar: '' });
      cargarDatos();
      alert('⚡ EVENTO PUBLICADO CON ÉXITO');
    } catch (error) {
      alert('Error al agregar evento');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ELIMINAR ESTE EVENTO?')) return;
    try {
      await authAxios.delete(`/eventos/${id}`);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar: Privilegios insuficientes');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await authAxios.put(`/eventos/${editingItem.id}`, editingItem);
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
        <h2>📅 EVENTOS / CONCIERTOS</h2>
      </div>

      {userRol === 'admin' && (
        <div className="form-section">
          <h3>PUBLICAR NUEVO EVENTO</h3>
          <form onSubmit={handleAdd} className="form-group-row">
            <input type="text" name="nombre" placeholder="Nombre del Evento" className="form-input" value={newItem.nombre} onChange={(e) => setNewItem({...newItem, nombre: e.target.value})} required />
            <input type="date" name="fecha" className="form-input" value={newItem.fecha} onChange={(e) => setNewItem({...newItem, fecha: e.target.value})} required />
            <input type="text" name="lugar" placeholder="Lugar" className="form-input" value={newItem.lugar} onChange={(e) => setNewItem({...newItem, lugar: e.target.value})} />
            <button type="submit" className="btn-add">⚡ AGREGAR</button>
          </form>
        </div>
      )}

      <div className="items-container">
        {data.length === 0 ? <p className="empty-message">No hay registros aún.</p> : (
          data.map((item) => (
            <div key={item.id} className="item-card evento-card">
              <div className="item-header">
                <h3>{item.nombre}</h3>
                
                {userRol === 'admin' && (
                  <div>
                    <button type="button" className="btn-edit" onClick={() => setEditingItem(item)}>✏️</button>
                    <button type="button" className="btn-delete" onClick={() => handleDelete(item.id)}>🗑️</button>
                  </div>
                )}
              </div>
              <p><strong>FECHA:</strong> {new Date(item.fecha).toLocaleDateString()}</p>
              <p><strong>LUGAR:</strong> {item.lugar}</p>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingItem && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ MODIFICAR EVENTO</h2>
              <span className="close-btn" onClick={() => setEditingItem(null)}>&times;</span>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-group-column">
                <input type="text" className="form-input" value={editingItem.nombre} onChange={(e) => setEditingItem({...editingItem, nombre: e.target.value})} required />
                <input type="date" className="form-input" value={editingItem.fecha?.split('T')[0] || ''} onChange={(e) => setEditingItem({...editingItem, fecha: e.target.value})} required />
                <input type="text" className="form-input" value={editingItem.lugar} onChange={(e) => setEditingItem({...editingItem, lugar: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setEditingItem(null)}>CANCELAR</button>
                <button type="submit" className="btn-save">💾 GUARDAR CAMBIOS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Eventos;
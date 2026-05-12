import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { searchMedia } from '../services/mockApi';

const NewEntryModal = ({ isOpen, onClose, itemToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef(null);

  const initialFormState = {
    type: 'game', title: '', description: '', genre: '',
    year: '', creator: '', imageUrl: '', status: 'watching'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setSearchResults([]);
      setShowDropdown(false);
      if (itemToEdit) {
        setFormData(itemToEdit);
      } else {
        setFormData(initialFormState);
      }
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({ ...formData, title });
    if (itemToEdit) return;

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (title.length > 2) {
      setSearching(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await searchMedia(formData.type, title);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (err) {
          console.error(err);
        } finally {
          setSearching(false);
        }
      }, 600);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      setSearching(false);
    }
  };

  const selectResult = (item) => {
    setFormData({
      ...formData,
      title: item.title,
      year: item.year ? String(item.year) : '',
      genre: item.genre || '',
      creator: item.creator || '',
      imageUrl: item.coverUrl || '',
      description: ''
    });
    setShowDropdown(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Obtenemos el uid del usuario logueado
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("Error: no hay sesión activa.");
      setLoading(false);
      return;
    }

    try {
      if (itemToEdit) {
        // EDICIÓN: actualizamos sin tocar el userId original
        const itemRef = doc(db, "items", itemToEdit.id);
        const dataToUpdate = { ...formData };
        delete dataToUpdate.id;
        await updateDoc(itemRef, dataToUpdate);
      } else {
        // CREACIÓN: guardamos con userId para saber de quién es
        await addDoc(collection(db, "items"), {
          ...formData,
          userId,           // <- LA CLAVE: vincula el ítem al usuario
          createdAt: new Date(),
        });
      }
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={() => setShowDropdown(false)}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>{itemToEdit ? 'Editar Entrada' : 'Nueva Entrada'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'white' }}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>

          <div className="form-group">
            <label>Tipo (Selecciona esto primero para buscar bien)</label>
            <select name="type" value={formData.type} onChange={handleChange} disabled={!!itemToEdit}>
              <option value="game">Videojuego</option>
              <option value="movie">Película</option>
              <option value="anime">Anime</option>
              <option value="book">Libro</option>
            </select>
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Título
              {searching && (
                <span style={{ color: 'var(--accent)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Loader size={12} /> Buscando...
                </span>
              )}
            </label>

            <div style={{ position: 'relative' }}>
              <textarea
                name="title"
                rows="1"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Escribe para autocompletar..."
                style={{ resize: 'none', paddingRight: '40px' }}
                autoComplete="off"
              />
              <Search size={18} style={{ position: 'absolute', right: '10px', top: '12px', color: '#666' }} />
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, width: '100%',
                background: '#222', border: '1px solid var(--accent)',
                borderRadius: '0 0 8px 8px', zIndex: 100,
                maxHeight: '200px', overflowY: 'auto',
                boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
              }}>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => selectResult(result)}
                    style={{
                      padding: '10px', display: 'flex', alignItems: 'center',
                      gap: '10px', cursor: 'pointer', borderBottom: '1px solid #333',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <img src={result.coverUrl} alt="cover" style={{ width: '30px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'white' }}>{result.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{result.year} • {result.creator || 'Desconocido'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Sinopsis..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Género</label>
              <textarea name="genre" rows="1" value={formData.genre} onChange={handleChange} style={{ resize: 'none' }} />
            </div>
            <div className="form-group">
              <label>Año</label>
              <textarea name="year" rows="1" value={formData.year} onChange={handleChange} style={{ resize: 'none' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Estudio / Autor</label>
            <textarea name="creator" rows="1" value={formData.creator} onChange={handleChange} style={{ resize: 'none' }} />
          </div>

          <div className="form-group">
            <label>URL Imagen</label>
            <textarea name="imageUrl" rows="1" required value={formData.imageUrl} onChange={handleChange} style={{ resize: 'none' }} placeholder="Se rellenará sola o pega una URL" />
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="completed">Completada</option>
              <option value="watching">Viendo / Jugando</option>
              <option value="plan_to_watch">Ver en el futuro</option>
              <option value="dropped">No me interesa</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Guardando...' : (itemToEdit ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntryModal;

import { useState } from 'react';
import { searchMedia } from '../services/mockApi';
import { X } from 'lucide-react';

const AddItemModal = ({ onClose, onAdd }) => {
  const [type, setType] = useState('game');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [status, setStatus] = useState('backlog');
  const [score, setScore] = useState('');

  const handleSearch = async () => {
    if (query.trim()) {
      const res = await searchMedia(type, query);
      setResults(res);
    }
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedItem) {
      const newItem = {
        ...selectedItem,
        status,
        score: status === 'completed' ? parseInt(score) : null,
      };
      onAdd(newItem);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>Añadir Nuevo Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo:</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="game">Juego</option>
              <option value="movie">Película</option>
              <option value="series">Serie</option>
              <option value="anime">Anime</option>
              <option value="book">Libro</option>
            </select>
          </div>
          <div className="form-group">
            <label>Buscar:</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe para buscar..."
            />
            <button type="button" onClick={handleSearch}>Buscar</button>
          </div>
          {results.length > 0 && (
            <div className="search-results">
              {results.map((item, index) => (
                <div
                  key={index}
                  className={`result-item ${selectedItem === item ? 'selected' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <img src={item.coverUrl} alt={item.title} />
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.year}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedItem && (
            <>
              <div className="form-group">
                <label>Estado:</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="backlog">Backlog</option>
                  <option value="completed">Completado</option>
                  <option value="dropped">Abandonado</option>
                </select>
              </div>
              {status === 'completed' && (
                <div className="form-group">
                  <label>Puntuación (0-10):</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>
              )}
              <button type="submit" className="submit-btn">Añadir</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
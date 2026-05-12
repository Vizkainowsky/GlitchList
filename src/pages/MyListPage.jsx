import { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Calendar, List, Filter, ArrowUpDown } from 'lucide-react';

// Cuántos ítems se muestran por "página"
const PAGE_SIZE = 12;

const MyListPage = ({ onEditItem }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  // Controla cuántos ítems mostramos (se incrementa al pulsar "Cargar más")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const navigate = useNavigate();
  const ICON_COLOR = '#bf00ff';

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Filtramos en Firestore directamente por userId: solo llegamos los documentos del usuario
    const q = query(
      collection(db, "items"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Reiniciamos la paginación cuando cambia el filtro o el orden
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterType, sortOrder]);

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de borrar esto de tu lista?")) {
      await deleteDoc(doc(db, "items", id));
    }
  };

  // Filtrado + ordenación en cliente (los datos ya son solo del usuario)
  const getProcessedItems = () => {
    let result = [...items];

    if (filterType !== 'all') {
      result = result.filter(item => item.type === filterType);
    }

    result.sort((a, b) => {
      switch (sortOrder) {
        case 'title-asc':  return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'year-new':   return parseInt(b.year || 0) - parseInt(a.year || 0);
        case 'year-old':   return parseInt(a.year || 0) - parseInt(b.year || 0);
        case 'newest':
        default:
          // Más recientes primero (por fecha de creación)
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
    });

    return result;
  };

  const processedItems = getProcessedItems();
  // Solo mostramos los primeros N ítems
  const visibleItems = processedItems.slice(0, visibleCount);
  const hasMore = visibleCount < processedItems.length;

  return (
    <div className="page-container" style={{ padding: '2rem' }}>

      {/* CABECERA CON FILTROS */}
      <header style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        gap: '2rem', marginBottom: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <List size={32} color={ICON_COLOR} />
          <h2 style={{ fontSize: '2rem', margin: 0, color: 'white' }}>
            Mi Lista
            {/* Contador total */}
            {!loading && (
              <span style={{ fontSize: '1rem', color: '#666', marginLeft: '0.75rem', fontWeight: 400 }}>
                ({processedItems.length} {processedItems.length === 1 ? 'ítem' : 'ítems'})
              </span>
            )}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>

          {/* Selector TIPO */}
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                background: '#1a1a1a', border: '1px solid #333', color: 'white',
                padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px', cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="all">Todo</option>
              <option value="game">Videojuegos</option>
              <option value="movie">Películas</option>
              <option value="anime">Anime</option>
              <option value="book">Libros</option>
            </select>
          </div>

          {/* Selector ORDEN */}
          <div style={{ position: 'relative' }}>
            <ArrowUpDown size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                background: '#1a1a1a', border: '1px solid #333', color: 'white',
                padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px', cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="newest">Más recientes</option>
              <option value="title-asc">Título (A-Z)</option>
              <option value="title-desc">Título (Z-A)</option>
              <option value="year-new">Año (Más nuevo)</option>
              <option value="year-old">Año (Más viejo)</option>
            </select>
          </div>

        </div>
      </header>

      {loading && <div className="spinner"></div>}

      {/* ESTADO VACÍO */}
      {!loading && processedItems.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', marginTop: '4rem' }}>
          <p style={{ fontSize: '1.1rem' }}>
            {items.length === 0 ? "Tu lista está vacía." : "No hay resultados para estos filtros."}
          </p>
          {items.length === 0 && (
            <p style={{ marginTop: '0.5rem' }}>
              Usa el botón <strong style={{ color: 'var(--accent)' }}>+</strong> para añadir contenido.
            </p>
          )}
        </div>
      )}

      {/* GRID */}
      <div className="anime-grid">
        {visibleItems.map((item) => (
          <div key={item.id} className="anime-card">

            <div
              className="card-image-wrapper"
              style={{ height: '280px', position: 'relative', cursor: 'pointer' }}
              onClick={() => navigate(`/item/${item.id}`)}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="card-image"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://placehold.co/300x450?text=Sin+Imagen'; }}
              />
              <div style={{
                position: 'absolute', top: '10px', right: '10px',
                background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '4px',
                fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold',
                border: '1px solid var(--accent)', color: 'white'
              }}>
                {item.status === 'plan_to_watch' ? 'Futuro' : item.status.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="card-info" style={{ padding: '1rem' }}>
              <div>
                <h3
                  className="card-title"
                  style={{ fontSize: '1rem', color: 'white', cursor: 'pointer' }}
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  {item.title}
                </h3>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#aaa', marginTop: '5px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {item.year}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '5px' }}>
                  {item.type.toUpperCase()} • {item.genre}
                </div>
              </div>

              <div className="card-actions" style={{ marginTop: '1rem' }}>
                <button
                  className="card-btn edit-btn"
                  onClick={() => onEditItem(item)}
                  style={{
                    background: 'rgba(0, 123, 255, 0.1)', border: '1px solid #007bff',
                    color: '#007bff', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', gap: '5px', padding: '0.5rem',
                    borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <Edit size={16} /> Editar
                </button>
                <button
                  className="card-btn delete-btn"
                  onClick={() => handleDelete(item.id)}
                  style={{
                    background: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff4444',
                    color: '#ff4444', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', gap: '5px', padding: '0.5rem',
                    borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN CARGAR MÁS */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button
            onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
            style={{
              background: 'transparent',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              padding: '0.75rem 2.5rem',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--accent)';
            }}
          >
            Cargar más ({processedItems.length - visibleCount} restantes)
          </button>
        </div>
      )}

    </div>
  );
};

export default MyListPage;

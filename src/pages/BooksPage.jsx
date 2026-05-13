import { useState } from 'react';
import { BookOpen, Search, User, Loader } from 'lucide-react';
import { getCache, setCache, cacheKey } from '../services/apiCache';

const PAGE_SIZE = 20;

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [startIndex, setStartIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

  const fetchBooks = async (term, start = 0, append = false) => {
    if (!term.trim()) return;

    if (append) setLoadingMore(true);
    else { setLoading(true); setBooks([]); setError(null); }

    const key = cacheKey('books', term, start);
    const cached = getCache(key);

    if (cached) {
      setTotalItems(cached.totalItems);
      setStartIndex(start + cached.items.length);
      setBooks(prev => append ? [...prev, ...cached.items] : cached.items);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(term)}&maxResults=${PAGE_SIZE}&startIndex=${start}&printType=books`
      );
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        const total = data.totalItems || 0;
        setCache(key, { items: data.items, totalItems: total });
        setTotalItems(total);
        setStartIndex(start + data.items.length);
        setBooks(prev => append ? [...prev, ...data.items] : data.items);
      } else {
        if (!append) {
          setBooks([]);
          setError('No se encontraron libros con ese término.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con Google Books. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setCurrentSearch(searchTerm);
    setStartIndex(0);
    fetchBooks(searchTerm, 0, false);
  };

  const handleLoadMore = () => fetchBooks(currentSearch, startIndex, true);

  const hasMore = books.length > 0 && books.length < Math.min(totalItems, 200) && books.length >= PAGE_SIZE;
  const TYPE_COLOR = 'var(--type-book)';

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header style={{
        marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BookOpen size={32} color={TYPE_COLOR} />
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Biblioteca</h2>
        </div>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Título o autor (ej. Brandon Sanderson)..."
            style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: 'white' }}
          />
          <button type="submit" style={{ background: TYPE_COLOR, border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>
            <Search size={20} />
          </button>
        </form>
      </header>

      {/* ESTADO INICIAL */}
      {!loading && books.length === 0 && !error && (
        <div style={{ textAlign: 'center', color: '#555', marginTop: '5rem' }}>
          <BookOpen size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
          <p style={{ fontSize: '1.1rem' }}>Escribe un título o autor y pulsa buscar.</p>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner"></div></div>}

      {!loading && !error && books.length > 0 && (
        <>
          <div className="anime-grid">
            {books.map((book) => {
              const info = book.volumeInfo;
              const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:') || null;
              return (
                <div key={book.id} className="anime-card">
                  <div className="card-image-wrapper" style={{ position: 'relative', height: '280px', overflow: 'hidden', background: '#2a2a2a' }}>
                    {thumbnail
                      ? <img src={thumbnail} alt={info.title} className="card-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}><BookOpen size={48} /></div>
                    }
                    {info.averageRating && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: TYPE_COLOR, color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ★ {info.averageRating}
                      </div>
                    )}
                  </div>
                  <div className="card-info" style={{ padding: '1rem' }}>
                    <h3 className="card-title" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white', marginBottom: '0.5rem' }}>
                      {info.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa', fontSize: '0.8rem' }}>
                      <User size={14} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {info.authors ? info.authors.join(', ') : 'Desconocido'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalItems > 0 && (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              Mostrando {books.length} de {Math.min(totalItems, 200).toLocaleString()} resultados
            </p>
          )}

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
              <button onClick={handleLoadMore} disabled={loadingMore}
                style={{
                  background: 'transparent', border: `1px solid ${TYPE_COLOR}`, color: TYPE_COLOR,
                  padding: '0.75rem 2.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: '600',
                  cursor: loadingMore ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                  display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: loadingMore ? 0.7 : 1
                }}
                onMouseEnter={(e) => { if (!loadingMore) { e.currentTarget.style.background = 'var(--type-book)'; e.currentTarget.style.color = 'white'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--type-book)'; }}
              >
                {loadingMore ? <><Loader size={16} /> Cargando...</> : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}><p>{error}</p></div>
      )}
    </div>
  );
};

export default BooksPage;

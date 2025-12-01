import { useState, useEffect } from 'react';
import { BookOpen, Search, User } from 'lucide-react';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("Brandon Sanderson");

  const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

  const fetchBooks = async (term) => {
    setLoading(true);
    setError(null);
    try {
      const query = term ? term : "subject:fiction";
      const response = await fetch(`${BASE_URL}?q=${query}&maxResults=20&printType=books`);
      const data = await response.json();
      if (data.items) setBooks(data.items);
      else { setBooks([]); setError("No se encontraron libros."); }
    } catch (err) {
      console.error(err);
      setError("Error con Google Books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(searchTerm); }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) fetchBooks(searchTerm);
  };

  const TYPE_COLOR = 'var(--type-book)'; 

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BookOpen size={32} color={TYPE_COLOR} />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Biblioteca</h2>
        </div>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Título o autor..." style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: 'white' }} />
          <button type="submit" style={{ background: TYPE_COLOR, border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>
            <Search size={20} />
          </button>
        </form>
      </header>

      {loading && <div style={{textAlign:'center', padding:'4rem', color:'#888'}} className="spinner"></div>}

      {!loading && !error && books.length > 0 && (
        <div className="anime-grid">
          {books.map((book) => {
            const info = book.volumeInfo;
            const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:') || null;
            return (
              <div key={book.id} className="anime-card">
                <div className="card-image-wrapper" style={{ position: 'relative', height: '280px', overflow: 'hidden', background: '#2a2a2a' }}>
                  {thumbnail ? (
                    <img src={thumbnail} alt={info.title} className="card-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}><BookOpen size={48} /></div>
                  )}
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
      )}
      {!loading && error && <div style={{textAlign:'center', padding:'2rem', color:'#888'}}>{error}</div>}
    </div>
  );
};

export default BooksPage;
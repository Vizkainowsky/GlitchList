import { useState, useEffect } from 'react';
import { Film, Calendar, Search, Loader } from 'lucide-react';

// OMDb devuelve máximo 10 resultados por página, pero tiene paginación con &page=N
const PAGE_SIZE = 10;

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("Evangelion");
  const [currentSearch, setCurrentSearch] = useState("Evangelion");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const API_KEY = import.meta.env.VITE_OMDB_KEY;
  const BASE_URL = 'https://www.omdbapi.com';

  const fetchMovies = async (term, page = 1, append = false) => {
    if (append) setLoadingMore(true);
    else { setLoading(true); setMovies([]); }
    setError(null);

    if (!API_KEY) {
      setError("Falta API Key de OMDb en .env");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/?apikey=${API_KEY}&s=${term}&type=movie&page=${page}`);
      const data = await res.json();

      if (data.Response === "True") {
        setTotalResults(parseInt(data.totalResults || 0));
        setCurrentPage(page);
        setMovies(prev => append ? [...prev, ...data.Search] : data.Search);
      } else {
        if (!append) {
          setMovies([]);
          setError(data.Error || "No se encontraron películas");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchMovies(currentSearch, 1, false); }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setCurrentSearch(searchTerm);
    setCurrentPage(1);
    fetchMovies(searchTerm, 1, false);
  };

  const handleLoadMore = () => fetchMovies(currentSearch, currentPage + 1, true);

  // OMDb pagina de 10 en 10, hay más si lo que hemos cargado es menor al total
  const hasMore = movies.length < totalResults;
  const TYPE_COLOR = 'var(--type-movie)';

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header style={{
        marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Film size={32} color={TYPE_COLOR} />
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Cine</h2>
        </div>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar película..."
            style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: 'white' }}
          />
          <button type="submit" style={{ background: TYPE_COLOR, border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>
            <Search size={20} />
          </button>
        </form>
      </header>

      {loading && <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner"></div></div>}

      {!loading && !error && movies.length > 0 && (
        <>
          <div className="anime-grid">
            {movies.map((movie) => (
              <div key={movie.imdbID} className="anime-card">
                <div className="card-image-wrapper" style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
                  <img
                    src={movie.Poster !== "N/A" ? movie.Poster : 'https://placehold.co/300x450?text=Sin+Imagen'}
                    alt={movie.Title} className="card-image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="card-info" style={{ padding: '1rem' }}>
                  <h3 className="card-title" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white', marginBottom: '0.5rem' }}>
                    {movie.Title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa', fontSize: '0.8rem' }}>
                    <Calendar size={14} /><span>{movie.Year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total de resultados */}
          {totalResults > 0 && (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              Mostrando {movies.length} de {totalResults} resultados
            </p>
          )}

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button onClick={handleLoadMore} disabled={loadingMore}
                style={{
                  background: 'transparent', border: `1px solid ${TYPE_COLOR}`, color: TYPE_COLOR,
                  padding: '0.75rem 2.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: '600',
                  cursor: loadingMore ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                  display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: loadingMore ? 0.7 : 1
                }}
                onMouseEnter={(e) => { if (!loadingMore) { e.currentTarget.style.background = 'var(--type-movie)'; e.currentTarget.style.color = 'white'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--type-movie)'; }}
              >
                {loadingMore ? <><Loader size={16} /> Cargando...</> : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>{error}</div>
      )}
    </div>
  );
};

export default MoviesPage;

import { useState, useEffect } from 'react';
import { Film, Calendar, Search, AlertCircle } from 'lucide-react';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("Pokemon"); 

  const API_KEY = import.meta.env.VITE_OMDB_KEY;
  const BASE_URL = 'https://www.omdbapi.com';

  const fetchMovies = async (term) => {
    setLoading(true);
    setError(null);

    if (!API_KEY) {
      setError("Falta API Key de OMDb en .env");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&s=${term}&type=movie`);
      const data = await response.json();

      if (data.Response === "True") {
        setMovies(data.Search);
      } else {
        setMovies([]);
        setError(data.Error || "No se encontraron películas");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovies(searchTerm); }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) fetchMovies(searchTerm);
  };

  const TYPE_COLOR = 'var(--type-movie)';

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Film size={32} color={TYPE_COLOR} />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Cine</h2>
        </div>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar película..." style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: 'white' }} />
          <button type="submit" style={{ background: TYPE_COLOR, border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>
            <Search size={20} />
          </button>
        </form>
      </header>

      {!loading && !error && movies.length > 0 && (
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
                  <Calendar size={14} />
                  <span>{movie.Year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && error && <div style={{textAlign:'center', padding:'2rem', color:'#888'}}>{error}</div>}
    </div>
  );
};

export default MoviesPage;
import { useState, useEffect } from 'react';
import { Gamepad2, Calendar, Search, AlertCircle, Trophy, Loader } from 'lucide-react';

const PAGE_SIZE = 20;

const GamesPage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [nextUrl, setNextUrl] = useState(null); // RAWG devuelve la URL de la siguiente página directamente

  const API_KEY = import.meta.env.VITE_RAWG_KEY;
  const BASE_URL = 'https://api.rawg.io/api';

  const fetchGames = async (term = "", append = false, overrideUrl = null) => {
    if (append) setLoadingMore(true);
    else { setLoading(true); setGames([]); }
    setError(null);

    if (!API_KEY) {
      setError("Falta la API Key de RAWG en el archivo .env");
      setLoading(false);
      return;
    }

    try {
      let url = overrideUrl;

      if (!url) {
        if (term) {
          url = `${BASE_URL}/games?key=${API_KEY}&search=${term}&page_size=${PAGE_SIZE}`;
        } else {
          const today = new Date().toISOString().split('T')[0];
          const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
          url = `${BASE_URL}/games?key=${API_KEY}&dates=${lastYear},${today}&ordering=-added&page_size=${PAGE_SIZE}`;
        }
      }

      const res = await fetch(url);
      const data = await res.json();

      // RAWG devuelve { next: "url_siguiente_pagina", results: [...] }
      setNextUrl(data.next || null);
      setGames(prev => append ? [...prev, ...data.results] : data.results || []);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con RAWG");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchGames(); }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentSearch(searchTerm);
    fetchGames(searchTerm, false);
  };

  // Al pulsar "Cargar más" usamos la nextUrl que nos dio RAWG
  const handleLoadMore = () => fetchGames(currentSearch, true, nextUrl);

  const THEME_COLOR = 'var(--type-game)';

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header style={{
        marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Gamepad2 size={32} color={THEME_COLOR} />
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Videojuegos</h2>
        </div>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar juego (ej. Elden Ring)..."
            style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: 'white' }}
          />
          <button type="submit" style={{ background: THEME_COLOR, border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', color: 'black', fontWeight: 'bold' }}>
            <Search size={20} />
          </button>
        </form>
      </header>

      {!API_KEY && (
        <div className="error-container" style={{ color: '#ff4444', textAlign: 'center' }}>
          <AlertCircle size={48} />
          <p>Necesitas configurar <code>VITE_RAWG_KEY</code> en tu archivo .env</p>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner"></div></div>}

      {!loading && !error && (
        <>
          <div className="anime-grid">
            {games.map((game) => (
              <div key={game.id} className="anime-card">
                <div className="card-image-wrapper" style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
                  <img
                    src={game.background_image || 'https://placehold.co/300x450?text=Sin+Imagen'}
                    alt={game.name} className="card-image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {game.metacritic && (
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: game.metacritic >= 80 ? '#66cc33' : '#ffcc33',
                      color: 'black', padding: '2px 6px', borderRadius: '4px',
                      fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Trophy size={12} />{game.metacritic}
                    </div>
                  )}
                </div>
                <div className="card-info" style={{ padding: '1rem' }}>
                  <h3 className="card-title" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white', marginBottom: '0.5rem' }}>
                    {game.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <Calendar size={14} /><span>{game.released ? game.released.split('-')[0] : 'TBA'}</span>
                    </div>
                    {game.rating > 0 && <span style={{ fontSize: '0.8rem', color: THEME_COLOR }}>★ {game.rating}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {nextUrl && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={handleLoadMore} disabled={loadingMore}
                style={{
                  background: 'transparent', border: '1px solid var(--type-game)', color: 'var(--type-game)',
                  padding: '0.75rem 2.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: '600',
                  cursor: loadingMore ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                  display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: loadingMore ? 0.7 : 1
                }}
                onMouseEnter={(e) => { if (!loadingMore) { e.currentTarget.style.background = 'var(--type-game)'; e.currentTarget.style.color = 'black'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--type-game)'; }}
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

export default GamesPage;

import { useState, useEffect } from 'react';
import { Gamepad2, Calendar, Search, AlertCircle, Trophy } from 'lucide-react';

const GamesPage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const API_KEY = import.meta.env.VITE_RAWG_KEY;
  const BASE_URL = 'https://api.rawg.io/api';

  const fetchGames = async (term = "") => {
    setLoading(true);
    setError(null);

    if (!API_KEY) {
      setError("Falta la API Key de RAWG en el archivo .env");
      setLoading(false);
      return;
    }

    try {
      let url = "";
      if (term) {
        url = `${BASE_URL}/games?key=${API_KEY}&search=${term}&page_size=20`;
      } else {
        const today = new Date().toISOString().split('T')[0];
        const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
        url = `${BASE_URL}/games?key=${API_KEY}&dates=${lastYear},${today}&ordering=-added&page_size=20`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        setGames(data.results);
      } else {
        setGames([]);
      }

    } catch (err) {
      console.error(err);
      setError("Error al conectar con RAWG");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGames(searchTerm);
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header style={{ 
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Gamepad2 size={32} color="var(--type-game)" />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Videojuegos</h2>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar juego (ej. Elden Ring)..."
            style={{
              flex: 1,
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #333',
              background: '#222',
              color: 'white'
            }}
          />
          <button type="submit" style={{
            background: 'var(--type-game)',
            border: 'none',
            borderRadius: '8px',
            padding: '0 20px',
            cursor: 'pointer',
            color: 'black',
            fontWeight: 'bold'
          }}>
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

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <div className="spinner"></div>
        </div>
      )}

      {!loading && !error && (
        <div className="anime-grid">
          {games.map((game) => (
            <div key={game.id} className="anime-card">

              <div className="card-image-wrapper" style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
                <img 
                  src={game.background_image || 'https://placehold.co/300x450?text=Sin+Imagen'} 
                  alt={game.name} 
                  className="card-image"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {game.metacritic && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: game.metacritic >= 80 ? '#66cc33' : '#ffcc33',
                    color: 'black',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid rgba(0,0,0,0.2)'
                  }}>
                    <Trophy size={12} />
                    {game.metacritic}
                  </div>
                )}
              </div>

              <div className="card-info" style={{ padding: '1rem' }}>
                <h3 className="card-title" style={{ 
                  fontSize: '1rem', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  color: 'white',
                  marginBottom: '0.5rem'
                }}>
                  {game.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <Calendar size={14} />
                        <span>{game.released ? game.released.split('-')[0] : 'TBA'}</span>
                    </div>
                    {game.rating > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--type-game)' }}>★ {game.rating}</span>
                    )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamesPage;
import { useState, useEffect } from 'react';
import { Zap, Search, Star, Calendar, MonitorPlay } from 'lucide-react';

const AnimePage = () => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = 'https://graphql.anilist.co';

  const query = `
  query ($search: String, $sort: [MediaSort]) {
    Page(perPage: 24) {
      media(search: $search, type: ANIME, sort: $sort) {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
          large
        }
        averageScore
        seasonYear
        format
        episodes
      }
    }
  }
  `;

  const fetchAnime = async (term = "") => {
    setLoading(true);
    setError(null);

    const variables = term 
      ? { search: term, sort: "SEARCH_MATCH" } 
      : { sort: "TRENDING_DESC" };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: variables
        })
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      if (data.data.Page.media) {
        setAnimes(data.data.Page.media);
      } else {
        setAnimes([]);
      }

    } catch (err) {
      console.error(err);
      setError("Error al conectar con AniList");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAnime(searchTerm);
  };

  const THEME_COLOR = '#ff00aa'; 

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      
      {/* Cabecera */}
      <header style={{ 
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Zap size={32} color={THEME_COLOR} fill={THEME_COLOR} />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Anime</h2>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar anime (ej. One Piece)..."
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
            background: THEME_COLOR,
            border: 'none',
            borderRadius: '8px',
            padding: '0 20px',
            cursor: 'pointer',
            color: 'white',
            fontWeight: 'bold'
          }}>
            <Search size={20} />
          </button>
        </form>
      </header>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <div className="spinner"></div>
        </div>
      )}

      {/* Grid de Resultados */}
      {!loading && !error && (
        <div className="anime-grid">
          {animes.map((anime) => (
            <div key={anime.id} className="anime-card">
              
              {/* Imagen */}
              <div className="card-image-wrapper" style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                <img 
                  src={anime.coverImage.extraLarge || anime.coverImage.large} 
                  alt={anime.title.romaji} 
                  className="card-image"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Badge de Puntuación */}
                {anime.averageScore && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(4px)',
                    color: THEME_COLOR,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    border: `1px solid ${THEME_COLOR}`
                  }}>
                    <Star size={12} fill={THEME_COLOR} />
                    {anime.averageScore}%
                  </div>
                )}

                {/* Badge de Formato (TV, MOVIE) */}
                {anime.format && (
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {anime.format}
                    </div>
                )}
              </div>

              {/* Info */}
              <div className="card-info" style={{ padding: '1rem' }}>
                <h3 className="card-title" style={{ 
                  fontSize: '1rem', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  color: 'white',
                  marginBottom: '0.5rem'
                }}>
                  {anime.title.english || anime.title.romaji}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  
                  {/* Año */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    <span>{anime.seasonYear || 'N/A'}</span>
                  </div>

                  {/* Episodios */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <MonitorPlay size={14} />
                     <span>{anime.episodes ? `${anime.episodes} eps` : '? eps'}</span>
                  </div>

                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Error o Sin resultados */}
      {!loading && (error || animes.length === 0) && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            {error ? <p>{error}</p> : <p>No se encontró ningún anime con ese nombre.</p>}
        </div>
      )}

    </div>
  );
};

export default AnimePage;
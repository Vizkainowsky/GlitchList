import { useState, useEffect } from 'react';
import { Zap, Search, Star, Calendar, MonitorPlay, Loader } from 'lucide-react';

const PAGE_SIZE = 20;
const API_URL = 'https://graphql.anilist.co';

const GQL = `
  query ($search: String, $sort: [MediaSort], $page: Int) {
    Page(page: $page, perPage: ${PAGE_SIZE}) {
      pageInfo { hasNextPage currentPage }
      media(search: $search, type: ANIME, sort: $sort) {
        id
        title { romaji english }
        coverImage { extraLarge large }
        averageScore seasonYear format episodes
      }
    }
  }
`;

const AnimePage = () => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchAnime = async (term = "", page = 1, append = false) => {
    if (append) setLoadingMore(true);
    else { setLoading(true); setAnimes([]); }
    setError(null);

    const variables = {
      page,
      ...(term ? { search: term, sort: "SEARCH_MATCH" } : { sort: "TRENDING_DESC" })
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query: GQL, variables })
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0].message);

      const pageData = data.data.Page;
      setHasNextPage(pageData.pageInfo.hasNextPage);
      setCurrentPage(pageData.pageInfo.currentPage);
      setAnimes(prev => append ? [...prev, ...pageData.media] : pageData.media || []);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con AniList");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchAnime(); }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentSearch(searchTerm);
    fetchAnime(searchTerm, 1, false);
  };

  const handleLoadMore = () => fetchAnime(currentSearch, currentPage + 1, true);

  const THEME_COLOR = '#ff00aa';

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header style={{
        marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Zap size={32} color={THEME_COLOR} fill={THEME_COLOR} />
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Anime</h2>
        </div>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar anime (ej. One Piece)..."
            style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: 'white' }}
          />
          <button type="submit" style={{ background: THEME_COLOR, border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>
            <Search size={20} />
          </button>
        </form>
      </header>

      {loading && <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner"></div></div>}

      {!loading && !error && (
        <>
          <div className="anime-grid">
            {animes.map((anime) => (
              <div key={anime.id} className="anime-card">
                <div className="card-image-wrapper" style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                  <img src={anime.coverImage.extraLarge || anime.coverImage.large} alt={anime.title.romaji}
                    className="card-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {anime.averageScore && (
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.8)',
                      backdropFilter: 'blur(4px)', color: THEME_COLOR, padding: '4px 8px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold', border: `1px solid ${THEME_COLOR}`
                    }}>
                      <Star size={12} fill={THEME_COLOR} />{anime.averageScore}%
                    </div>
                  )}
                  {anime.format && (
                    <div style={{
                      position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)',
                      color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px'
                    }}>{anime.format}</div>
                  )}
                </div>
                <div className="card-info" style={{ padding: '1rem' }}>
                  <h3 className="card-title" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white', marginBottom: '0.5rem' }}>
                    {anime.title.english || anime.title.romaji}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /><span>{anime.seasonYear || 'N/A'}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MonitorPlay size={14} /><span>{anime.episodes ? `${anime.episodes} eps` : '? eps'}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasNextPage && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={handleLoadMore} disabled={loadingMore}
                style={{
                  background: 'transparent', border: `1px solid ${THEME_COLOR}`, color: THEME_COLOR,
                  padding: '0.75rem 2.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: '600',
                  cursor: loadingMore ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                  display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: loadingMore ? 0.7 : 1
                }}
                onMouseEnter={(e) => { if (!loadingMore) { e.currentTarget.style.background = THEME_COLOR; e.currentTarget.style.color = 'white'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = THEME_COLOR; }}
              >
                {loadingMore ? <><Loader size={16} /> Cargando...</> : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && (error || animes.length === 0) && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          {error ? <p>{error}</p> : <p>No se encontró ningún anime con ese nombre.</p>}
        </div>
      )}
    </div>
  );
};

export default AnimePage;

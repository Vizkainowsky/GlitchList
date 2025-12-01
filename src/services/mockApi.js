const TMDB_KEY = import.meta.env.VITE_OMDB_KEY; 
const RAWG_KEY = import.meta.env.VITE_RAWG_KEY;
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

const OMDB_URL = 'https://www.omdbapi.com';
const RAWG_URL = 'https://api.rawg.io/api';
const ANILIST_URL = 'https://graphql.anilist.co';
const GOOGLE_URL = 'https://www.googleapis.com/books/v1/volumes';

// --- FUNCIONES ESPECÍFICAS POR TIPO ---

// 1. Videojuegos (RAWG)
const searchGames = async (query) => {
  if (!RAWG_KEY) return [];
  try {
    const res = await fetch(`${RAWG_URL}/games?key=${RAWG_KEY}&search=${query}&page_size=5`);
    const data = await res.json();
    
    return data.results.map(game => ({
      title: game.name,
      year: game.released ? game.released.split('-')[0] : 'N/A',
      coverUrl: game.background_image || 'https://placehold.co/200x300?text=No+Image',
      genre: game.genres?.slice(0, 2).map(g => g.name).join(', ') || '', 
      creator: '' 
    }));
  } catch (error) {
    console.error("Error buscando juegos:", error);
    return [];
  }
};

// 2. Películas (OMDb)
const searchMovies = async (query) => {
  if (!TMDB_KEY) return [];
  try {
    const res = await fetch(`${OMDB_URL}/?apikey=${TMDB_KEY}&s=${query}&type=movie`);
    const data = await res.json();

    if (data.Response === "True") {
      return data.Search.map(movie => ({
        title: movie.Title,
        year: movie.Year,
        coverUrl: movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/200x300?text=No+Image',
        genre: 'Cine',
        creator: '' 
      }));
    }
    return [];
  } catch (error) {
    console.error("Error buscando pelis:", error);
    return [];
  }
};

// 3. Anime (AniList GraphQL)
const searchAnime = async (query) => {
  const gqlQuery = `
  query ($search: String) {
    Page(perPage: 5) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        title { romaji english }
        seasonYear
        coverImage { large }
        genres
        studios(isMain: true) { nodes { name } }
      }
    }
  }
  `;

  try {
    const res = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query: gqlQuery, variables: { search: query } })
    });
    const data = await res.json();

    return data.data.Page.media.map(anime => ({
      title: anime.title.english || anime.title.romaji,
      year: anime.seasonYear || 'N/A',
      coverUrl: anime.coverImage.large,
      genre: anime.genres?.slice(0, 2).join(', ') || 'Anime',
      creator: anime.studios?.nodes[0]?.name || '' 
    }));
  } catch (error) {
    console.error("Error buscando anime:", error);
    return [];
  }
};

// 4. Libros (Google Books)
const searchBooks = async (query) => {
  try {
    const keyParam = GOOGLE_KEY ? `&key=${GOOGLE_KEY}` : '';
    const res = await fetch(`${GOOGLE_URL}?q=${query}&maxResults=5&printType=books${keyParam}`);
    const data = await res.json();

    if (data.items) {
      return data.items.map(book => {
        const info = book.volumeInfo;
        return {
          title: info.title,
          year: info.publishedDate ? info.publishedDate.split('-')[0] : 'N/A',
          coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://placehold.co/200x300?text=No+Cover',
          genre: info.categories ? info.categories[0] : 'Libro',
          creator: info.authors ? info.authors.join(', ') : '' 
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Error buscando libros:", error);
    return [];
  }
};

// --- FUNCIÓN PRINCIPAL EXPORTADA ---
export const searchMedia = async (type, query) => {
  if (!query) return [];
  switch (type) {
    case 'game': return await searchGames(query);
    case 'movie': return await searchMovies(query);
    case 'anime': return await searchAnime(query);
    case 'book': return await searchBooks(query);
    default: return [];
  }
};
const typeColors = {
  game: 'var(--type-game)',
  movie: 'var(--type-movie)',
  series: '#ffaa00',
  book: 'var(--type-book)',
  anime: '#ff00aa',
};

const MediaCard = ({ item, isBacklog }) => {
  const cardStyle = {
    borderColor: typeColors[item.type] || 'var(--accent)',
  };

  const imageStyle = {
    filter: isBacklog ? 'grayscale(100%)' : 'none',
    opacity: isBacklog ? 0.6 : 1,
  };

  return (
    <div className="media-card glass" style={cardStyle}>
      <div className="card-image" style={imageStyle}>
        <img src={item.coverUrl} alt={item.title} />
      </div>
      <div className="card-content">
        <h3>{item.title}</h3>
        <p className="card-type" style={{ color: typeColors[item.type] }}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </p>
        {item.status === 'completed' && item.score && (
          <p className="card-score">Puntuación: {item.score}/10</p>
        )}
        <p className="card-status">{item.status}</p>
      </div>
    </div>
  );
};

export default MediaCard;
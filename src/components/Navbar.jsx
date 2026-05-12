import { Plus, Gamepad2, Film, BookOpen, Zap, List, LogOut, BarChart2 } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Navbar = ({ user, onAddItem }) => {

  const navLinks = [
    { name: 'games',   label: 'Juegos',       icon: Gamepad2,  color: 'var(--type-game)' },
    { name: 'movies',  label: 'Películas',     icon: Film,      color: 'var(--type-movie)' },
    { name: 'anime',   label: 'Anime',         icon: Zap,       color: '#ff00aa' },
    { name: 'books',   label: 'Libros',        icon: BookOpen,  color: 'var(--type-book)' },
    { name: 'my-list', label: 'Mi Lista',      icon: List,      color: '#bf00ff' },
    { name: 'stats',   label: 'Estadísticas',  icon: BarChart2, color: '#00ccff' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al salir:", error);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">

          <Link to="/" className="logo-link" style={{ textDecoration: 'none' }}>
            <h2 style={{
              marginRight: '2rem',
              fontSize: '1.5rem',
              fontWeight: '800',
              background: 'linear-gradient(to right, #d946ef, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block'
            }}>
              MediaVerse
            </h2>
          </Link>

          <div className="nav-links">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={`/${link.name}`}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    '--item-color': link.color,
                    borderColor: isActive ? link.color : 'transparent',
                    color: isActive ? link.color : 'var(--text-secondary)'
                  })}
                >
                  <Icon size={18} />
                  <span className="nav-label">{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="user-section">
            {user && (
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)',
                  color: '#ff6666', padding: '0.5rem 1rem', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 68, 68, 0.2)';
                  e.currentTarget.style.borderColor = '#ff4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 68, 68, 0.3)';
                }}
              >
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            )}
          </div>

        </div>
      </nav>

      <button className="fab glow" onClick={onAddItem}>
        <Plus size={24} />
      </button>
    </>
  );
};

export default Navbar;

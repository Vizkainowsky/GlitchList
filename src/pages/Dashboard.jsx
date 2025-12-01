import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MediaCard from '../components/MediaCard';
import AddItemModal from '../components/AddItemModal'; 
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([
    { id: 1, type: 'game', title: 'Elden Ring', status: 'completed', score: 9, coverUrl: 'https://placehold.co/200x300?text=Elden+Ring' },
    { id: 2, type: 'movie', title: 'Inception', status: 'backlog', coverUrl: 'https://placehold.co/200x300?text=Inception' },
  ]);
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [tab, setTab] = useState('collection');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const filteredItems = items
    .filter(item => filterType === 'all' || item.type === filterType)
    .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(item => tab === 'collection' ? item.status !== 'backlog' : item.status === 'backlog')
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

  const handleAddItem = () => {
    setShowModal(true);
  };

  const handleItemAdded = (newItem) => {
    setItems([...items, { ...newItem, id: Date.now() }]);
    setShowModal(false);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="app-layout">
      <Sidebar
        onFilterType={setFilterType}
        onSort={setSortOrder}
        currentFilter={filterType}
        currentSort={sortOrder}
      />
      <div className="main-content">
        <Navbar user={user} onSearch={setSearchQuery} onAddItem={handleAddItem} />
        <div className="dashboard-content">
          <div className="tabs">
            <button
              className={`tab ${tab === 'collection' ? 'active' : ''}`}
              onClick={() => setTab('collection')}
            >
              Colección
            </button>
            <button
              className={`tab ${tab === 'backlog' ? 'active' : ''}`}
              onClick={() => setTab('backlog')}
            >
              Backlog
            </button>
          </div>
          <div className="media-grid">
            {filteredItems.map(item => (
              <MediaCard key={item.id} item={item} isBacklog={tab === 'backlog'} />
            ))}
          </div>
        </div>
        {showModal && (
          <AddItemModal onClose={() => setShowModal(false)} onAdd={handleItemAdded} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
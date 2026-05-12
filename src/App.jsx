import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Navbar from './components/Navbar';
import NewEntryModal from './components/NewEntryModal';
import Landing from './pages/Landing';

import AnimePage from './pages/AnimePage';
import MoviesPage from './pages/MoviesPage';
import GamesPage from './pages/GamesPage';
import BooksPage from './pages/BooksPage';
import MyListPage from './pages/MyListPage';
import ItemDetailPage from './pages/ItemDetailPage';
import StatsPage from './pages/StatsPage';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  if (authLoading) return (
    <div style={{ height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"></div>
    </div>
  );

  if (!user) return <Landing />;

  return (
    <div className="app">
      <Navbar user={user} onAddItem={handleOpenCreate} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #bf00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Bienvenido al Dashboard
              </h1>
              <p style={{ color: '#aaa', fontSize: '1.2rem' }}>Selecciona una categoría en el menú para empezar.</p>
            </div>
          } />

          <Route path="/anime"   element={<AnimePage />} />
          <Route path="/movies"  element={<MoviesPage />} />
          <Route path="/games"   element={<GamesPage />} />
          <Route path="/books"   element={<BooksPage />} />
          <Route path="/my-list" element={<MyListPage onEditItem={handleOpenEdit} />} />
          <Route path="/stats"   element={<StatsPage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <NewEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemToEdit={editingItem}
      />
    </div>
  );
}

export default App;

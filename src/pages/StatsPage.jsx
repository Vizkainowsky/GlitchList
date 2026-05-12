import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { BarChart2, Gamepad2, Film, BookOpen, Zap, Star, Clock, CheckCircle, TrendingUp } from 'lucide-react';

// ─── Colores por tipo ───────────────────────────────────────────────────────
const TYPE_COLORS = {
  game:  '#00ffcc',
  movie: '#ff0066',
  book:  '#f59e0b',
  anime: '#ff00aa',
};

const TYPE_LABELS = {
  game:  'Videojuegos',
  movie: 'Películas',
  book:  'Libros',
  anime: 'Anime',
};

const TYPE_ICONS = {
  game:  Gamepad2,
  movie: Film,
  book:  BookOpen,
  anime: Zap,
};

const STATUS_COLORS = {
  completed:     '#4ade80',
  watching:      '#60a5fa',
  plan_to_watch: '#a78bfa',
  dropped:       '#f87171',
};

const STATUS_LABELS = {
  completed:     'Completado',
  watching:      'En progreso',
  plan_to_watch: 'Pendiente',
  dropped:       'Abandonado',
};

// ─── Tooltip custom para el Pie ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1a1a1a', border: '1px solid #333',
        padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem'
      }}>
        <p style={{ color: payload[0].payload.fill, margin: 0, fontWeight: 'bold' }}>
          {payload[0].name}
        </p>
        <p style={{ color: 'white', margin: 0 }}>{payload[0].value} ítems</p>
      </div>
    );
  }
  return null;
};

// ─── Tarjeta de estadística individual ──────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div style={{
    background: '#161616', border: `1px solid ${color}33`,
    borderRadius: '12px', padding: '1.5rem',
    display: 'flex', alignItems: 'center', gap: '1.2rem',
    boxShadow: `0 0 20px ${color}11`
  }}>
    <div style={{
      width: '52px', height: '52px', borderRadius: '12px',
      background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={26} color={color} />
    </div>
    <div>
      <p style={{ color: '#888', fontSize: '0.8rem', margin: 0, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
      <p style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: '#555', fontSize: '0.75rem', margin: 0, marginTop: '4px' }}>{sub}</p>}
    </div>
  </div>
);

// ─── Componente principal ────────────────────────────────────────────────────
const StatsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
        const q = query(collection(db, 'items'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const total = items.length;

  // Por tipo
  const byType = Object.entries(TYPE_LABELS).map(([key, label]) => ({
    name: label,
    value: items.filter(i => i.type === key).length,
    fill: TYPE_COLORS[key],
  })).filter(d => d.value > 0);

  // Por estado
  const byStatus = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: items.filter(i => i.status === key).length,
    fill: STATUS_COLORS[key],
  })).filter(d => d.value > 0);

  // Completados
  const completed = items.filter(i => i.status === 'completed').length;
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Puntuación media (solo ítems con userRating > 0)
  const rated = items.filter(i => i.userRating && i.userRating > 0);
  const avgRating = rated.length > 0
    ? (rated.reduce((sum, i) => sum + i.userRating, 0) / rated.length).toFixed(1)
    : '—';

  // Últimos 5 añadidos
  const recent = [...items]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 5);

  // Top géneros
  const genreCounts = {};
  items.forEach(i => {
    if (i.genre) {
      const g = i.genre.trim();
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    }
  });
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  if (loading) return (
    <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"></div>
    </div>
  );

  if (total === 0) return (
    <div className="page-container" style={{ padding: '2rem', textAlign: 'center', paddingTop: '5rem' }}>
      <BarChart2 size={64} style={{ opacity: 0.15, marginBottom: '1rem' }} />
      <h2 style={{ color: '#555' }}>Aún no hay datos</h2>
      <p style={{ color: '#444' }}>Añade ítems a tu lista para ver tus estadísticas aquí.</p>
    </div>
  );

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* CABECERA */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BarChart2 size={32} color="#bf00ff" />
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Mis Estadísticas</h2>
        </div>
      </header>

      {/* TARJETAS RESUMEN */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem'
      }}>
        <StatCard icon={TrendingUp}    label="Total en lista"   value={total}          color="#bf00ff" />
        <StatCard icon={CheckCircle}   label="Completados"      value={completed}      color="#4ade80" sub={`${completedPct}% del total`} />
        <StatCard icon={Star}          label="Puntuación media" value={avgRating}      color="#ffcc00" sub={rated.length > 0 ? `sobre ${rated.length} valorados` : 'Sin valoraciones aún'} />
        <StatCard icon={Clock}         label="Pendientes"       value={items.filter(i => i.status === 'plan_to_watch').length} color="#a78bfa" />
      </div>

      {/* GRÁFICOS: DONUT + BARRAS DE ESTADO */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>

        {/* DONUT — por tipo */}
        <div style={{ background: '#161616', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Por categoría</h3>

          {/* Leyenda de tipos con contador */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const count = items.filter(i => i.type === key).length;
              if (count === 0) return null;
              const Icon = TYPE_ICONS[key];
              return (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: `${TYPE_COLORS[key]}15`, border: `1px solid ${TYPE_COLORS[key]}44`,
                  borderRadius: '20px', padding: '4px 12px'
                }}>
                  <Icon size={13} color={TYPE_COLORS[key]} />
                  <span style={{ color: TYPE_COLORS[key], fontSize: '0.8rem', fontWeight: '600' }}>{label}</span>
                  <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: '800' }}>{count}</span>
                </div>
              );
            })}
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={byType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {byType.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BARRAS — por estado */}
        <div style={{ background: '#161616', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Por estado</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byStatus} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#aaa', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: 'white' }}
                itemStyle={{ color: '#aaa' }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Ítems">
                {byStatus.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP GÉNEROS */}
      {topGenres.length > 0 && (
        <div style={{ background: '#161616', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '2.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Géneros más frecuentes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topGenres} margin={{ left: 0, right: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#aaa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: 'white' }}
                itemStyle={{ color: '#bf00ff' }}
              />
              <Bar dataKey="value" fill="#bf00ff" radius={[6, 6, 0, 0]} name="Ítems" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AÑADIDOS RECIENTEMENTE */}
      {recent.length > 0 && (
        <div style={{ background: '#161616', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ margin: '0 0 1.2rem', color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Añadidos recientemente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recent.map(item => {
              const Icon = TYPE_ICONS[item.type] || TrendingUp;
              const color = TYPE_COLORS[item.type] || '#bf00ff';
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.75rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.title} style={{ width: '36px', height: '52px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    : <div style={{ width: '36px', height: '52px', background: '#222', borderRadius: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color={color} />
                      </div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'white', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                    <p style={{ color: '#666', fontSize: '0.78rem', margin: 0, marginTop: '2px' }}>{item.year} • {item.genre || '—'}</p>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    background: `${color}20`, color: color, border: `1px solid ${color}44`,
                    flexShrink: 0
                  }}>
                    {TYPE_LABELS[item.type]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default StatsPage;

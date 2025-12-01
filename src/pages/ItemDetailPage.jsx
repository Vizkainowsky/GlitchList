import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Star, Save, Calendar, User, Tag } from 'lucide-react';

const ItemDetailPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "items", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setItem(data);
          setRating(data.userRating || 0);
          setReview(data.userReview || "");
        } else {
          console.log("No such document!");
          navigate('/my-list'); 
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "items", id);
      await updateDoc(docRef, {
        userRating: rating,
        userReview: review
      });
      alert("¡Opinión guardada!");
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}><div className="spinner"></div></div>;
  if (!item) return null;

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'transparent', border: 'none', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '1rem' }}
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        <div>
          <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginBottom: '1.5rem' }}>
            <img src={item.imageUrl} alt={item.title} style={{ width: '100%', display: 'block' }} />
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--accent)' }}>Ficha Técnica</h3>
            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ddd' }}><Tag size={16} color="var(--accent)"/> {item.genre}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ddd' }}><Calendar size={16} color="var(--accent)"/> {item.year}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ddd' }}><User size={16} color="var(--accent)"/> {item.creator}</p>
            <p style={{ color: '#aaa', marginTop: '1rem', lineHeight: '1.6', fontStyle: 'italic' }}>"{item.description}"</p>
          </div>
        </div>

        <div>
          <span style={{ 
            background: 'var(--accent)', color: 'white', padding: '4px 12px', 
            borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' 
          }}>
            {item.type}
          </span>
          
          <h1 style={{ fontSize: '3rem', margin: '1rem 0', lineHeight: '1.1' }}>{item.title}</h1>
          
          <div style={{ 
            background: item.status === 'completed' ? '#4CAF50' : '#2196F3', 
            display: 'inline-block', padding: '5px 15px', borderRadius: '5px', 
            fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '2rem' 
          }}>
            Estado: {item.status === 'plan_to_watch' ? 'En espera' : item.status.replace(/_/g, ' ')}
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '2rem 0' }} />

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star fill="white" /> Tu Reseña
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Puntuación (1-10)</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={32} 
                  cursor="pointer"
                  fill={rating >= star * 2 ? '#ffcc00' : 'none'} 
                  color={rating >= star * 2 ? '#ffcc00' : '#666'}
                  onClick={() => setRating(star * 2)} 
                />
              ))}
              <span style={{ fontSize: '1.5rem', marginLeft: '10px', fontWeight: 'bold', color: '#ffcc00' }}>{rating}/10</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Tus notas / Comentarios</label>
            <textarea 
              rows="6" 
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="¿Qué te ha parecido? Escribe aquí tus pensamientos..."
              style={{ 
                width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', 
                color: 'white', padding: '1rem', borderRadius: '8px', fontSize: '1rem', resize: 'vertical'
              }}
            />
          </div>

          <button 
            onClick={handleSaveChanges} 
            disabled={isSaving}
            className="cta-button" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', borderRadius: '8px' }}
          >
            <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Opinión'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
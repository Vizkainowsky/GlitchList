import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; 
import { auth } from '../firebase';

const Landing = () => {
  const [errorMsg, setErrorMsg] = useState('');
//Login de la pagina
  const handleLogin = async () => {
    setErrorMsg(''); 
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error login:', error);
      setErrorMsg(`Error: ${error.message}`);
    }
  };

  return (
    <div className="landing">
      <div className="hero">
        <h1>MediaVerse</h1>
        <p>Tu universo multimedia personal.</p>
        
        <button className="cta-button" onClick={handleLogin}>
           Loggeate con Google
        </button>

        {errorMsg && (
          <p style={{color: 'red', marginTop: '1rem', background: 'rgba(0,0,0,0.8)', padding: '10px'}}>
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default Landing;
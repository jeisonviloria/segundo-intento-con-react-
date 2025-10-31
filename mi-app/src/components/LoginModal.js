import React, { memo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authErrors } from '../firebase/auth';

const LoginModal = memo(function LoginModal({ onClose, onLogin }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await login();
      if (onLogin) {
        onLogin();
      }
      onClose();
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError(error.message);
      
      // Si el error es de cancelación de popup, no mostrar alerta
      if (error.code !== 'auth/cancelled-popup-request') {
        const errorMessage = authErrors[error.code] || error.message;
        alert(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <h2 style={{ marginBottom: 25, color: '#333' }}>🎮 Iniciar Sesión</h2>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 20 }}>Inicia sesión para compartir tus juegos favoritos y participar en la comunidad.</p>
          
          {error && (
            <div style={{ 
              color: '#dc3545', 
              marginBottom: 15, 
              padding: '10px', 
              backgroundColor: '#ffebee', 
              borderRadius: '4px' 
            }}>
              {error}
            </div>
          )}
          
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="google-login-btn"
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#fff',
              color: '#757575',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google logo"
              style={{ width: '20px', marginRight: '10px' }}
            />
            Continuar con Google
          </button>
          
          <p style={{ marginTop: 20, fontSize: '14px', color: '#666' }}>
            Al iniciar sesión, aceptas nuestros términos y condiciones de uso.
          </p>
        </div>
      </div>
    </div>
  );
});

export default LoginModal;
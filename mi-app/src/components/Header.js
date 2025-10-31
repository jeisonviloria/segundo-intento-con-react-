import React from 'react';
import { auth } from '../firebase/config';

export function Header({ user, onPublishClick, onProfileClick, onLoginClick, onLogout }) {
  return (
    <header>
      <div className="header-content">
        <h1>🎮 Juegos Desconocidos</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user ? (
            <>
              <div 
                onClick={onProfileClick}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '20px',
                  transition: 'background-color 0.3s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                {user.foto && (
                  <img 
                    src={user.foto} 
                    alt={user.nombre} 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%',
                      border: '2px solid white'
                    }} 
                  />
                )}
                <span className="hide-mobile">{user.nombre}</span>
              </div>
              <button className="btn" onClick={onPublishClick}>
                <span>+</span>
                <span className="hide-mobile">Publicar Juego</span>
                <span className="show-mobile">Publicar</span>
              </button>
              <button 
                className="btn" 
                onClick={onLogout}
                style={{ backgroundColor: '#dc3545' }}
              >
                Salir
              </button>
            </>
          ) : (
            <button className="btn" onClick={onLoginClick}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
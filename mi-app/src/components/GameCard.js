import React, { memo, useState } from 'react';
import '../games.css';

const GameCard = memo(function GameCard({ 
  game, 
  onView, 
  onLike, 
  onToggleFavorite, 
  isFavorite,
  onDelete,
  onEdit,
  currentUserId 
}) {
  const [showOptions, setShowOptions] = useState(false);

  if (!game || !game.id) {
    console.error('GameCard: Se requiere un juego válido con ID');
    return null;
  }

  if (!onView || typeof onView !== 'function') {
    console.error('GameCard: Se requiere la función onView');
    return null;
  }

  if (!onLike || typeof onLike !== 'function') {
    console.error('GameCard: Se requiere la función onLike');
    return null;
  }
  
  return (
    <div className="game-card">
      <div className="game-card-header">
        <div className="header-top">
          <div className="author-info">
            {game.autorFoto && (
              <img 
                src={game.autorFoto} 
                alt={game.autor} 
                className="author-avatar"
              />
            )}
            <span className="author-name">{game.autor}</span>
          </div>
          {game.userId === currentUserId && (
            <div className="options-container">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
                className="options-button"
              >
                ⋮
              </button>
              {showOptions && (
                <div className="options-menu">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    onEdit(game);
                    setShowOptions(false);
                  }}>
                    ✏️ Editar
                  </button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
                      const gameId = String(game.id);
                      console.log('GameCard: Eliminando juego con ID:', gameId);
                      onDelete(gameId);
                    }
                    setShowOptions(false);
                  }}>
                    🗑️ Eliminar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <h3>{game.titulo} {game.año ? `(${game.año})` : ''}</h3>
        <div className="game-meta">{game.plataforma} · {game.genero}</div>
      </div>
      <p className="game-desc">{game.descripcion}</p>
      <div className="game-actions">
        <button className="btn small" onClick={() => onView(game)}>Ver</button>
        <button className="btn small" onClick={() => onLike(game.id)} data-game-id={game.id}>
          <span className="like-icon">👍</span> {game.likes || 0}
        </button>
        {onToggleFavorite && (
          <button 
            className={`btn small favorite-btn ${isFavorite ? 'is-favorite' : ''}`} 
            onClick={() => onToggleFavorite(game.id)}
          >
            <span className="favorite-icon">{isFavorite ? '⭐' : '☆'}</span>
          </button>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Verificar si las props son nulas o indefinidas
  if (!prevProps.game || !nextProps.game) {
    return false;
  }

  // Comparar las propiedades esenciales del juego
  const gamePropsEqual = 
    prevProps.game.id === nextProps.game.id &&
    prevProps.game.likes === nextProps.game.likes &&
    prevProps.game.titulo === nextProps.game.titulo &&
    prevProps.game.descripcion === nextProps.game.descripcion;

  // Comparar el estado de favorito
  const favoriteEqual = prevProps.isFavorite === nextProps.isFavorite;

  // Comparar las referencias de las funciones
  const handlersEqual = 
    prevProps.onView === nextProps.onView &&
    prevProps.onLike === nextProps.onLike &&
    prevProps.onToggleFavorite === nextProps.onToggleFavorite;

  return gamePropsEqual && favoriteEqual && handlersEqual;
});

export default GameCard;

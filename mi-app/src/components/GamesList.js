import React from 'react';
import GameCard from './GameCard';

export function GamesList({ games, onView, onLike, onToggleFavorite, userFavorites }) {
  if (games.length === 0) {
    return (
      <div className="empty-state">
        <h2>🎲</h2>
        <p>¡Aún no hay juegos publicados!</p>
        <p style={{ fontSize: 16, marginTop: 15 }}>Sé el primero en compartir un juego desconocido</p>
      </div>
    );
  }

  return (
    <div className="juegos-grid" id="juegos-container">
      {games.map(game => (
        <GameCard 
          key={game.id} 
          game={game} 
          onView={onView} 
          onLike={onLike}
          onToggleFavorite={onToggleFavorite}
          isFavorite={userFavorites.includes(game.id)}
        />
      ))}
    </div>
  );
}
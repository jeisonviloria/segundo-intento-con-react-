import React, { memo } from 'react';

const Stats = memo(function Stats({ total, comentarios, likes }) {
  return (
    <div className="stats">
      <div className="stat-item">
        <div className="stat-number" id="total-juegos">{total}</div>
        <div className="stat-label">Juegos Publicados</div>
      </div>
      <div className="stat-item">
        <div className="stat-number" id="total-comentarios">{comentarios}</div>
        <div className="stat-label">Comentarios</div>
      </div>
      <div className="stat-item">
        <div className="stat-number" id="total-likes">{likes}</div>
        <div className="stat-label">Likes Totales</div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderiza si alguna estadística cambió
  return (
    prevProps.total === nextProps.total &&
    prevProps.comentarios === nextProps.comentarios &&
    prevProps.likes === nextProps.likes
  );
});

export default Stats;
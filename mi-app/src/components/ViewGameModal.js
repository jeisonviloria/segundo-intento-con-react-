import React, { memo } from 'react';

const ViewGameModal = memo(function ViewGameModal({ game, onClose, onComment }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const comentario = {
      id: Date.now(),
      usuario: form['comentario-usuario'].value.trim(),
      calificacion: Number(form['calificacion'].value || 5),
      texto: form['comentario-texto'].value.trim(),
      fecha: new Date().toISOString()
    };
    onComment(comentario);
    form.reset();
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <div id="detalles-juego">
          <h2>{game.titulo}</h2>
          <div className="game-meta">
            <span>{game.plataforma}</span>
            {game.genero && <span>· {game.genero}</span>}
            {game.año && <span>· {game.año}</span>}
          </div>
          <p style={{ marginTop: 12 }}>{game.descripcion}</p>
          <div style={{ marginTop: 10 }}>
            Publicado por <strong>{game.autor}</strong>
            <span style={{ marginLeft: 15 }}>· 👍 {game.likes || 0} likes</span>
          </div>
        </div>

        <div className="comentarios-section">
          <h3>💬 Comentarios y Opiniones</h3>
          <form id="form-comentario" style={{ margin: '20px 0' }} onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tu nombre:</label>
              <input type="text" name="comentario-usuario" required placeholder="¿Cómo te llamas?" />
            </div>
            <div className="form-group">
              <label>Calificación:</label>
              <select name="calificacion">
                <option value="5">⭐⭐⭐⭐⭐ Obra maestra (5)</option>
                <option value="4">⭐⭐⭐⭐ Muy bueno (4)</option>
                <option value="3">⭐⭐⭐ Bueno (3)</option>
                <option value="2">⭐⭐ Regular (2)</option>
                <option value="1">⭐ Malo (1)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tu opinión:</label>
              <textarea name="comentario-texto" required placeholder="Comparte tu experiencia con este juego..."></textarea>
            </div>
            <button type="submit" className="btn" style={{ width: '100%' }}>💬 Enviar Comentario</button>
          </form>

          <div id="comentarios-lista">
            {(game.comentarios || []).length === 0 ? <p>No hay comentarios aún.</p> : (
              (game.comentarios || []).map(c => (
                <div className="comentario" key={c.id}>
                  <div className="comentario-header">
                    <strong>{c.usuario}</strong> · {"⭐".repeat(c.calificacion)}
                  </div>
                  <div className="comentario-body">{c.texto}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
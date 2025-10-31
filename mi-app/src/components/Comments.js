import React from 'react';

export function CommentsList({ comments }) {
  if (!comments || comments.length === 0) {
    return <p>No hay comentarios aún.</p>;
  }

  return (
    <div id="comentarios-lista">
      {comments.map(comment => (
        <div className="comentario" key={comment.id}>
          <div className="comentario-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {comment.usuarioFoto && (
                <img 
                  src={comment.usuarioFoto} 
                  alt={comment.usuario} 
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%',
                    border: '1px solid #ddd'
                  }} 
                />
              )}
              <strong>{comment.usuario}</strong>
            </div>
            <div>{"⭐".repeat(comment.calificacion)}</div>
          </div>
          <div className="comentario-body">{comment.texto}</div>
          <div className="comentario-fecha">
            {new Date(comment.fecha).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentForm({ onSubmit, user }) {
  return (
    <form id="form-comentario" style={{ margin: '20px 0' }} onSubmit={onSubmit}>
      <div className="form-group">
        <label>Tu nombre:</label>
        <input 
          type="text" 
          name="comentario-usuario" 
          required 
          placeholder="¿Cómo te llamas?"
          defaultValue={user?.nombre || ''} 
        />
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
        <textarea 
          name="comentario-texto" 
          required 
          placeholder="Comparte tu experiencia con este juego..."
        ></textarea>
      </div>
      <button type="submit" className="btn" style={{ width: '100%' }}>
        💬 Enviar Comentario
      </button>
    </form>
  );
}
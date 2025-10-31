import React, { memo } from 'react';

const PublishGameModal = memo(function PublishGameModal({ onClose, onSubmit, alert, user, gameToEdit }) {
  const isEditing = Boolean(gameToEdit);

  const handleSubmit = React.useCallback((e) => {
    if (!user) return;
    
    e.preventDefault();
    const form = e.target;
    const gameData = {
      titulo: form['titulo'].value.trim(),
      descripcion: form['descripcion'].value.trim(),
      plataforma: form['plataforma'].value,
      genero: form['genero'].value.trim(),
      año: form['año'].value ? Number(form['año'].value) : null,
    };

    if (!isEditing) {
      // Si es una nueva publicación
      gameData.id = Date.now();
      gameData.autor = user.nombre;
      gameData.userId = user.id;
      gameData.autorFoto = user.foto || null;
      gameData.likes = 0;
      gameData.comentarios = [];
      gameData.fechaPublicacion = new Date().toISOString();
    }

    onSubmit(gameData, isEditing);
  }, [onSubmit, isEditing, user]);

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        {!user ? (
          <>
            <h2>Necesitas iniciar sesión</h2>
            <p>Por favor, inicia sesión para publicar un juego.</p>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: 25, color: '#333' }}>
              {isEditing ? '✏️ Editar Juego' : '🎮 Publicar Juego Desconocido'}
            </h2>
            <form id="form-juego" onSubmit={handleSubmit}>
          <div className="form-group author-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              {user.foto ? (
                <img 
                  src={user.foto} 
                  alt={user.nombre} 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    border: '2px solid #ddd'
                  }} 
                />
              ) : (
                <div 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    border: '2px solid #ddd',
                    backgroundColor: '#e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}
                >
                  {user.nombre?.charAt(0) || '?'}
                </div>
              )}
              <span>
                {isEditing ? 'Editando como ' : 'Publicando como '}
                <strong>{user.nombre}</strong>
              </span>
            </div>
          </div>
          <div className="form-group">
            <label>Título del juego:</label>
            <input 
              type="text" 
              name="titulo" 
              required 
              placeholder="Nombre del juego"
              defaultValue={gameToEdit?.titulo || ''}
            />
          </div>
          <div className="form-group">
            <label>Descripción:</label>
            <textarea 
              name="descripcion" 
              required 
              placeholder="Cuéntanos sobre este juego desconocido..."
              defaultValue={gameToEdit?.descripcion || ''}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Plataforma:</label>
            <select 
              name="plataforma" 
              required
              defaultValue={gameToEdit?.plataforma || ''}
            >
              <option value="">Selecciona una plataforma...</option>
              <option value="PC">💻 PC</option>
              <option value="PlayStation">🎮 PlayStation</option>
              <option value="Xbox">🎮 Xbox</option>
              <option value="Nintendo">🎮 Nintendo</option>
              <option value="Móvil">📱 Móvil</option>
              <option value="Retro">👾 Retro/Consola Antigua</option>
              <option value="Arcade">🕹️ Arcade</option>
              <option value="Otra">🎯 Otra</option>
            </select>
          </div>
          <div className="form-group">
            <label>Género:</label>
            <input 
              type="text" 
              name="genero" 
              placeholder="RPG, Aventura, Puzzle, Terror, etc."
              defaultValue={gameToEdit?.genero || ''}
            />
          </div>
          <div className="form-group">
            <label>Año (opcional):</label>
            <input 
              type="number" 
              name="año" 
              min="1970" 
              max="2025" 
              placeholder="¿En qué año salió?"
              defaultValue={gameToEdit?.año || ''}
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: 10 }}>
            {isEditing ? 'Guardar Cambios' : 'Publicar Juego'}
          </button>
            </form>
          </>
        )}
        {alert && <div className="alert">{alert}</div>}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian las props importantes
  return (
    prevProps.alert === nextProps.alert &&
    prevProps.user?.id === nextProps.user?.id
  );
});

export default PublishGameModal;
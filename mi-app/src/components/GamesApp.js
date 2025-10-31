import React, { useEffect, useState } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  onSnapshot,
  query as firestoreQuery,
  orderBy,
  where,
  increment
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import GameCard from './GameCard';
import { validarCampo, validarAño } from '../utils/validaciones';
import { Header } from './Header';
import { GamesList } from './GamesList';
import { CommentsList, CommentForm } from './Comments';
import Stats from './Stats';
import PublishGameModal from './PublishGameModal';
import ViewGameModal from './ViewGameModal';
import LoginModal from './LoginModal';
import UserProfile from './UserProfile';
import '../games.css';

export default function GamesApp() {
  const { user, login, logout } = useAuth();
  const [juegos, setJuegos] = useState([]);
  const [query, setQuery] = useState('');
  const [alert, setAlert] = useState('');
  const [showPublish, setShowPublish] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [activeView, setActiveView] = useState('games');
  const [userFavorites, setUserFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Cargar juegos desde Firestore y mantener sincronización en tiempo real
  useEffect(() => {
    const gamesCollection = collection(db, 'games');
    // Crear una consulta ordenada por fecha de publicación
    const q = firestoreQuery(
      gamesCollection,
      orderBy('fechaPublicacion', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gamesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id // Asegurarnos de que el ID sea consistente
      }));

      setJuegos(gamesData);
      setLoading(false);
    }, (error) => {
      console.error('Error al cargar juegos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cargar favoritos cuando el usuario inicia sesión
  useEffect(() => {
    const loadUserFavorites = async () => {
      try {
        if (user) {
          const userRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userRef);
          const favoritesData = userDoc.exists() ? (userDoc.data().favoritos || []) : [];
          setUserFavorites(Array.isArray(favoritesData) ? favoritesData : []);
        } else {
          setUserFavorites([]);
        }
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
        setUserFavorites([]);
      }
    };

    loadUserFavorites();
  }, [user]);

  const stats = () => {
    const total = juegos.length;
    const comentarios = juegos.reduce((s, g) => s + (g.comentarios?.length || 0), 0);
    const likes = juegos.reduce((s, g) => s + (g.likes || 0), 0);
    return { total, comentarios, likes };
  }

  function abrirModalPublicar() {
    setShowPublish(true);
  }
  function cerrarModal() {
    setShowPublish(false);
    setShowView(false);
    setShowLogin(false);
    setActiveGame(null);
  }

  async function toggleFavorite(gameId) {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      let currentFavorites = [];
      
      if (userDoc.exists()) {
        currentFavorites = userDoc.data().favoritos || [];
      }

      let newFavorites;
      if (currentFavorites.includes(gameId)) {
        newFavorites = currentFavorites.filter(id => id !== gameId);
      } else {
        newFavorites = [...currentFavorites, gameId];
      }

      await setDoc(userRef, { favoritos: newFavorites }, { merge: true });
      setUserFavorites(newFavorites);
      
      setAlert(currentFavorites.includes(gameId) ? 
        '❌ Juego eliminado de favoritos' : 
        '⭐ Juego añadido a favoritos');
      setTimeout(() => setAlert(''), 2000);
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      setAlert('Error al actualizar favoritos. Intente nuevamente.');
      setTimeout(() => setAlert(''), 3000);
    }
  }

  async function handlePublish(e) {
    e.preventDefault();
    const form = e.target;
    const campos = {
      titulo: form['titulo'].value.trim(),
      descripcion: form['descripcion'].value.trim(),
      plataforma: form['plataforma'].value,
      genero: form['genero'].value.trim(),
      año: form['año'].value
    };

    // Validar campos
    const errores = [];
    Object.entries(campos).forEach(([campo, valor]) => {
      if (campo === 'año') {
        const error = validarAño(valor);
        if (error) errores.push(error);
      } else if (campo === 'plataforma') {
        if (!valor) errores.push('Selecciona una plataforma');
      } else {
        const error = validarCampo(valor, campo);
        if (error) errores.push(error);
      }
    });

    // Validar contenido duplicado
    const tituloNormalizado = campos.titulo.toLowerCase();
    const existente = juegos.find(g => g.titulo.toLowerCase() === tituloNormalizado);
    if (existente) {
      errores.push('Ya existe un juego con este título');
    }

    if (errores.length > 0) {
      setAlert(errores.join('. '));
      setTimeout(() => setAlert(''), 5000);
      return;
    }

    try {
      const gamesCollection = collection(db, 'games');
      const docRef = await addDoc(gamesCollection, {
        ...campos,
        año: campos.año ? Number(campos.año) : null,
        likes: 0,
        comentarios: [],
        fechaPublicacion: new Date().toISOString(),
        userId: user.id,
        autor: user.nombre,
        autorFoto: user.foto
      });

      const nuevo = {
        id: docRef.id,
        ...campos,
        año: campos.año ? Number(campos.año) : null,
        likes: 0,
        comentarios: [],
        fechaPublicacion: new Date().toISOString(),
        userId: user.id,
        autor: user.nombre,
        autorFoto: user.foto
      };

      setJuegos(prev => [nuevo, ...prev]);
      form.reset();
      setAlert('¡Juego publicado correctamente! ✅');
      setTimeout(() => setAlert(''), 2000);
      cerrarModal();
    } catch (error) {
      console.error('Error al publicar:', error);
      setAlert('Error al publicar el juego. Intente nuevamente.');
      setTimeout(() => setAlert(''), 3000);
    }
  }

  function buscarJuegos(q) {
    setQuery(q);
  }

  function verJuego(game) {
    if (!game || !game.id) {
      console.error('Intento de ver juego sin ID válido:', game);
      setAlert('Error: No se puede ver este juego');
      setTimeout(() => setAlert(''), 3000);
      return;
    }
    
    // Asegurarse de que todos los campos necesarios estén presentes
    const gameWithDefaults = {
      ...game,
      id: String(game.id),
      likes: game.likes || 0,
      comentarios: game.comentarios || [],
      fechaPublicacion: game.fechaPublicacion || new Date().toISOString()
    };
    
    setActiveGame(gameWithDefaults);
    setShowView(true);
  }

  async function likeJuego(id) {
    try {
      if (!user) {
        setAlert('Debes iniciar sesión para dar like');
        setShowLogin(true);
        return;
      }

      const gameId = String(id);
      const gameRef = doc(db, 'games', gameId);
      
      // Verificar el estado actual del like
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        setAlert('Este juego ya no está disponible');
        return;
      }

      const gameData = gameDoc.data();
      const likesBy = gameData.likesBy || [];
      const hasLiked = likesBy.includes(user.id);
      const currentLikes = gameData.likes || 0;
      
      // Actualizar likes y likesBy
      const newLikes = hasLiked ? currentLikes - 1 : currentLikes + 1;
      await updateDoc(gameRef, {
        likes: newLikes,
        likesBy: hasLiked 
          ? likesBy.filter(id => id !== user.id)
          : [...likesBy, user.id]
      });

      // Actualizar estado local inmediatamente
      setJuegos(prevGames =>
        prevGames.map(game =>
          game.id === gameId
            ? { 
                ...game, 
                likes: newLikes,
                likesBy: hasLiked
                  ? (game.likesBy || []).filter(id => id !== user.id)
                  : [...(game.likesBy || []), user.id]
              }
            : game
        )
      );

      // Actualizar juego activo si es necesario
      if (activeGame && activeGame.id === gameId) {
        setActiveGame(prev => ({
          ...prev,
          likes: newLikes,
          likesBy: hasLiked
            ? (prev.likesBy || []).filter(id => id !== user.id)
            : [...(prev.likesBy || []), user.id]
        }));
      }

      // Mostrar feedback
      setAlert(hasLiked ? '👎 Like removido' : '👍 ¡Like agregado!');
      setTimeout(() => setAlert(''), 2000);

    } catch (error) {
      console.error('Error al dar like:', error);
      setAlert('Error al dar like. Por favor, intenta nuevamente.');
      setTimeout(() => setAlert(''), 3000);
    }
  }

  async function submitComentario(e) {
    e.preventDefault();
    
    // Validar que tengamos un juego activo y un ID válido
    if (!activeGame) {
      setAlert('Error: No se encontró el juego');
      setTimeout(() => setAlert(''), 3000);
      return;
    }

    // Asegurarse de que el ID sea una cadena válida
    const gameId = String(activeGame.id || '').trim();
    if (!gameId) {
      setAlert('Error: ID de juego no válido');
      setTimeout(() => setAlert(''), 3000);
      return;
    }

    try {
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      
      if (!gameDoc.exists()) {
        setAlert('Este juego ya no está disponible');
        setJuegos(prev => prev.filter(g => String(g.id) !== gameId));
        cerrarModal();
        setTimeout(() => setAlert(''), 3000);
        return;
      }
    } catch (error) {
      console.error('Error al verificar el juego:', error);
      setAlert('Error al verificar el juego. Por favor, intenta de nuevo.');
      setTimeout(() => setAlert(''), 3000);
      return;
    }
    
    const form = e.target;
    const campos = {
      usuario: form['comentario-usuario'].value.trim(),
      texto: form['comentario-texto'].value.trim()
    };
    const calificacion = Number(form['calificacion'].value || 5);

    // Validar campos
    const errores = [];
    const errorUsuario = validarCampo(campos.usuario, 'autor');
    const errorTexto = validarCampo(campos.texto, 'comentario');
    if (errorUsuario) errores.push(errorUsuario);
    if (errorTexto) errores.push(errorTexto);

    // Validar spam/duplicados
    const comentariosDelJuego = activeGame.comentarios || [];
    const ultimoComentario = comentariosDelJuego[0];
    if (ultimoComentario && ultimoComentario.usuario === campos.usuario) {
      const tiempoDesdeUltimo = Date.now() - new Date(ultimoComentario.fecha).getTime();
      const minutos = tiempoDesdeUltimo / (1000 * 60);
      if (minutos < 1) {
        errores.push('Espera al menos 1 minuto entre comentarios');
      }
    }

    if (errores.length > 0) {
      setAlert(errores.join('. '));
      setTimeout(() => setAlert(''), 5000);
      return;
    }

    if (!user) {
      setAlert('Debes iniciar sesión para comentar');
      setShowLogin(true);
      return;
    }

    if (!user || !user.id) {
      setAlert('Debes iniciar sesión para comentar');
      setShowLogin(true);
      return;
    }

    const comentario = {
      id: Date.now(),
      usuario: user.nombre,
      userId: user.id,
      usuarioFoto: user.foto,
      calificacion,
      texto: campos.texto,
      fecha: new Date().toISOString()
    };

    try {
      // Validar que tenemos un juego activo con ID válido
      if (!activeGame || !activeGame.id) {
        setAlert('Error: No hay juego seleccionado');
        setTimeout(() => setAlert(''), 3000);
        return;
      }

      const gameId = String(activeGame.id);
      
      // Verificar si el juego existe en el estado local
      const gameInState = juegos.find(g => String(g.id) === gameId);
      if (!gameInState) {
        setAlert('Error: No se encontró el juego');
        setTimeout(() => setAlert(''), 3000);
        return;
      }

      // Actualizar en Firestore con retry
      let error;
      for (let i = 0; i < 3; i++) {
        try {
          const gameRef = doc(db, 'games', gameId);
          const gameDoc = await getDoc(gameRef);
          
          if (!gameDoc.exists()) {
            setAlert('El juego ya no existe. La página se actualizará.');
            setTimeout(() => window.location.reload(), 2000);
            return;
          }

          const gameData = gameDoc.data();
          const currentComments = gameData?.comentarios || [];
          
          // Mantener todos los datos existentes y solo actualizar comentarios
          await setDoc(gameRef, {
            ...gameData,
            comentarios: [comentario, ...currentComments]
          }, { merge: true });

          // Actualizar estado local
          setJuegos(prev => prev.map(g => 
            String(g.id) === gameId 
              ? { ...g, comentarios: [comentario, ...(g.comentarios || [])] }
              : g
          ));

          form.reset();
          setAlert('¡Comentario publicado! ✅');
          setTimeout(() => setAlert(''), 2000);

          // Actualizar activeGame
          setActiveGame(prev => ({
            ...prev,
            comentarios: [comentario, ...(prev.comentarios || [])]
          }));

          setShowErrorToast(false);
          return; // Éxito, salir del ciclo
        } catch (e) {
          error = e;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de reintentar
          continue;
        }
      }

      // Si llegamos aquí, fallaron todos los intentos
      throw error || new Error('Error al publicar comentario después de múltiples intentos');
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      let mensajeError = 'Error al publicar el comentario. Por favor, intenta nuevamente.';
      
      if (error.code === 'invalid-argument') {
        mensajeError = 'Error: El ID del juego no es válido';
      } else if (error.code === 'not-found') {
        mensajeError = 'El juego ya no está disponible';
        setJuegos(prev => prev.filter(g => String(g.id) !== String(activeGame?.id)));
        cerrarModal();
      }
      
      setAlert(mensajeError);
      setTimeout(() => setAlert(''), 3000);
    }
  }

  const { total, comentarios, likes } = stats();

  const filtered = juegos.filter(g => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (g.titulo || '').toLowerCase().includes(q) || (g.genero || '').toLowerCase().includes(q) || (g.descripcion || '').toLowerCase().includes(q);
  });

  return (
    <div className="app-root">
      <Header 
        user={user}
        onPublishClick={abrirModalPublicar}
        onProfileClick={() => setActiveView('profile')}
        onLoginClick={() => setShowLogin(true)}
        onLogout={async () => {
          try {
            await logout();
            setActiveView('games');
          } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setAlert('Error al cerrar sesión. Por favor, intenta nuevamente.');
            setTimeout(() => setAlert(''), 3000);
          }
        }}
      />

      <div className="container">
        {activeView === 'profile' ? (
          <>
            <button 
              className="btn" 
              onClick={() => setActiveView('games')}
              style={{ marginBottom: '20px' }}
            >
              ← Volver a Juegos
            </button>
            <UserProfile />
          </>
        ) : (
          <>
            <Stats total={total} comentarios={comentarios} likes={likes} />

            <div className="search-bar">
              <input value={query} onChange={e => buscarJuegos(e.target.value)} type="text" id="busqueda" placeholder="🔍 Buscar juegos por título, género o descripción..." />
            </div>

            <div id="alert" className="alert">{alert}</div>

            <div className="juegos-grid" id="juegos-container">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <h2>🎲</h2>
                  <p>¡Aún no hay juegos publicados!</p>
                  <p style={{ fontSize: 16, marginTop: 15 }}>Sé el primero en compartir un juego desconocido</p>
                </div>
              ) : (
                filtered.map(g => (
                  <GameCard 
                    key={g.id} 
                    game={g} 
                    onView={verJuego} 
                    onLike={likeJuego}
                    onToggleFavorite={user ? toggleFavorite : null}
                    isFavorite={Array.isArray(userFavorites) && userFavorites.includes(g.id)}
                    onDelete={async (id) => {
                      try {
                        if (!user || !user.id) {
                          setAlert('Debes iniciar sesión para eliminar publicaciones');
                          setShowLogin(true);
                          return;
                        }

                        // Asegurarnos de que el ID sea una cadena
                        const gameId = String(id);
                        console.log('Intentando eliminar juego con ID:', gameId);

                        // Verificar permisos y existencia en Firestore
                        const gameRef = doc(db, 'games', gameId);
                        const gameDoc = await getDoc(gameRef);
                        
                        if (!gameDoc.exists()) {
                          console.log('Juego no encontrado en Firestore');
                          setAlert('Esta publicación ya no existe');
                          setJuegos(prevGames => prevGames.filter(g => String(g.id) !== gameId));
                          return;
                        }

                        const gameData = gameDoc.data();
                        if (gameData.userId !== user.id) {
                          console.log('Usuario no autorizado:', gameData.userId, user.id);
                          setAlert('No tienes permiso para eliminar esta publicación');
                          return;
                        }

                        // Eliminar el documento completamente en lugar de marcarlo como eliminado
                        console.log('Eliminando documento...');
                        await deleteDoc(gameRef);
                        
                        // Actualizar el estado local inmediatamente
                        setJuegos(prevGames => prevGames.filter(g => String(g.id) !== gameId));
                        
                        // Cerrar el modal si el juego eliminado estaba siendo visualizado
                        if (activeGame && String(activeGame.id) === gameId) {
                          setActiveGame(null);
                          setShowView(false);
                        }

                        setAlert('Publicación eliminada correctamente');
                        setTimeout(() => setAlert(''), 2000);
                      } catch (error) {
                        console.error('Error al eliminar:', error);
                        setAlert('Error al eliminar la publicación');
                        setTimeout(() => setAlert(''), 3000);
                      }
                    }}
                    onEdit={(game) => {
                      setActiveGame(game);
                      setShowPublish(true);
                    }}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal Publicar/Editar Juego */}
      {showPublish && (
        <PublishGameModal 
          user={user}
          onClose={cerrarModal}
          gameToEdit={activeGame}
          onSubmit={async (gameData, isEditing) => {
            try {
              if (isEditing && activeGame) {
                // Actualizar juego existente
                const gameRef = doc(db, 'games', activeGame.id);
                await updateDoc(gameRef, {
                  ...gameData,
                  ultimaEdicion: new Date().toISOString()
                });

                setJuegos(prev => 
                  prev.map(game => 
                    game.id === activeGame.id 
                      ? { ...game, ...gameData, ultimaEdicion: new Date().toISOString() }
                      : game
                  )
                );

                setAlert('¡Juego actualizado correctamente! ✅');
              } else {
                // Crear nuevo juego
                const gamesCollection = collection(db, 'games');
                const newGameData = {
                  ...gameData,
                  userId: user.id,
                  autor: user.nombre,
                  autorFoto: user.foto,
                  likes: 0,
                  comentarios: [],
                  deleted: false,
                  likesBy: [],
                  fechaPublicacion: new Date().toISOString()
                };

                const docRef = await addDoc(gamesCollection, newGameData);
                const newGame = {
                  ...newGameData,
                  id: docRef.id
                };

                setJuegos(prev => [newGame, ...prev]);
                setAlert('¡Juego publicado correctamente! ✅');
              }

              setTimeout(() => setAlert(''), 2000);
              cerrarModal();
            } catch (error) {
              console.error('Error al guardar juego:', error);
              setAlert(isEditing ? 
                'Error al actualizar el juego. Por favor, intenta nuevamente.' :
                'Error al publicar el juego. Por favor, intenta nuevamente.'
              );
              setTimeout(() => setAlert(''), 3000);
            }
          }}
          alert={alert}
        />
      )}

      {/* Modal Ver Juego */}
      {showView && activeGame && (
        <div className="modal" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={cerrarModal}>&times;</span>
            <div id="detalles-juego">
              <h2>{activeGame.titulo}</h2>
              <div className="game-meta">
                <span>{activeGame.plataforma}</span>
                {activeGame.genero && <span>· {activeGame.genero}</span>}
                {activeGame.año && <span>· {activeGame.año}</span>}
              </div>
              <p style={{ marginTop: 12 }}>{activeGame.descripcion}</p>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeGame.autorFoto && (
                  <img 
                    src={activeGame.autorFoto} 
                    alt={activeGame.autor} 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%',
                      border: '2px solid #ddd'
                    }} 
                  />
                )}
                <div>
                  Publicado por <strong>{activeGame.autor}</strong>
                  <span style={{ marginLeft: 15 }}>· 👍 {activeGame.likes || 0} likes</span>
                </div>
              </div>
            </div>
            <div className="comentarios-section">
              <h3>💬 Comentarios y Opiniones</h3>
              <form id="form-comentario" style={{ margin: '20px 0' }} onSubmit={submitComentario}>
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
                {(activeGame.comentarios || []).length === 0 ? <p>No hay comentarios aún.</p> : (
                  (activeGame.comentarios || []).map(c => (
                    <div className="comentario" key={c.id}>
                      <div className="comentario-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {c.usuarioFoto && (
                            <img 
                              src={c.usuarioFoto} 
                              alt={c.usuario} 
                              style={{ 
                                width: '24px', 
                                height: '24px', 
                                borderRadius: '50%',
                                border: '1px solid #ddd'
                              }} 
                            />
                          )}
                          <strong>{c.usuario}</strong>
                        </div>
                        <div>{"⭐".repeat(c.calificacion)}</div>
                      </div>
                      <div className="comentario-body">{c.texto}</div>
                      <div className="comentario-fecha">
                        {new Date(c.fecha).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Login */}
      {showLogin && (
        <LoginModal 
          onClose={cerrarModal}
          onLogin={() => {
            cerrarModal();
          }}
        />
      )}
    </div>
  );
}

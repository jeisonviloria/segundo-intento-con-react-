import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import './UserProfile.css';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const UserProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [games, setGames] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('games');
  const [stats, setStats] = useState({
    totalGames: 0,
    totalComments: 0,
    totalFavorites: 0,
    totalLikes: 0
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Crear o actualizar el documento del usuario y cargar datos relacionados
    async function loadUserData() {
      try {
        console.log('User data:', user); // Para depuración
        
        // Asegurarnos de usar el ID correcto
        const userId = user?.uid || user?.id;
        if (!userId) {
          throw new Error('No se pudo obtener el ID del usuario');
        }

        const userDocRef = doc(db, 'users', userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (!userDocSnapshot.exists()) {
          await setDoc(userDocRef, {
            nombre: user.nombre || user.displayName,
            email: user.email,
            foto: user.foto || user.photoURL,
            fechaCreacion: new Date().toISOString(),
            favoritos: [],
            ultimaActividad: new Date().toISOString()
          });
        }

        // Cargar juegos publicados
        const gamesQuery = query(
          collection(db, 'games'),
          where('userId', '==', userId),
          orderBy('fechaPublicacion', 'desc')
        );
        
        const gamesSnapshot = await getDocs(gamesQuery);
        const userGames = gamesSnapshot.docs
          .map(d => ({
            id: d.id,
            ...d.data()
          }))
          .filter(game => !game.deleted);
        setGames(userGames);

        // Buscar comentarios dentro de los juegos
        const allGamesQuery = query(collection(db, 'games'));
        const allGamesSnapshot = await getDocs(allGamesQuery);
        
        let userCommentsData = [];
        
        allGamesSnapshot.docs.forEach(gameDoc => {
          if (!gameDoc.exists()) return;
          
          const gameData = gameDoc.data();
          if (!gameData || gameData.deleted) return;
          
          // Asegurarse de que comentarios sea un array
          const gameComments = Array.isArray(gameData.comentarios) ? gameData.comentarios : [];
          
          const userGameComments = gameComments
            .filter(comment => comment && comment.userId === userId)
            .map(comment => ({
              ...comment,
              gameId: gameDoc.id,
              gameTitle: gameData.titulo || 'Juego sin título'
            }));
          
          userCommentsData = [...userCommentsData, ...userGameComments];
        });

        // Ordenar comentarios por fecha
        userCommentsData.sort((a, b) => 
          new Date(b.fecha) - new Date(a.fecha)
        );
        setUserComments(userCommentsData);

        // Cargar favoritos (leer documento actualizado por si se creó)
        let favoritesGames = [];
        try {
          const freshUserDoc = await getDoc(userDocRef);
          if (freshUserDoc.exists()) {
            const userData = freshUserDoc.data();
            // Asegurarnos de que favoritos es un array y contiene strings válidos
            const favoritos = (userData?.favoritos || []).filter(id => 
              typeof id === 'string' && id.length > 0
            );
            
            if (favoritos.length > 0) {
              // Cargar cada juego favorito individualmente para mejor manejo de errores
              for (const gameId of favoritos) {
                try {
                  const gameDoc = await getDoc(doc(db, 'games', gameId));
                  if (gameDoc.exists()) {
                    const gameData = gameDoc.data();
                    if (gameData && !gameData.deleted) {
                      favoritesGames.push({
                        id: gameDoc.id,
                        ...gameData
                      });
                    }
                  }
                } catch (gameError) {
                  console.warn(`Error al cargar juego favorito ${gameId}:`, gameError);
                  continue;
                }
              }
            }
          }
        } catch (error) {
          console.error('Error al cargar favoritos:', error);
        }
        // Actualizar el estado de favoritos
        setFavorites(favoritesGames);

        // Actualizar estadísticas con validación
        try {
          // Asegurarse de que todos los arrays son válidos
          const validGames = Array.isArray(userGames) ? userGames : [];
          const validComments = Array.isArray(userCommentsData) ? userCommentsData : [];
          
          // Calcular el total de likes de forma segura
          const totalLikes = validGames.reduce((sum, game) => {
            const likes = game && typeof game.likes === 'number' ? game.likes : 0;
            return sum + likes;
          }, 0);

          setStats({
            totalGames: validGames.length,
            totalComments: validComments.length,
            totalFavorites: favoritesGames.length,
            totalLikes: totalLikes
          });
        } catch (error) {
          console.error('Error al actualizar estadísticas:', error);
          // Establecer valores por defecto en caso de error
          setStats({
            totalGames: 0,
            totalComments: 0,
            totalFavorites: 0,
            totalLikes: 0
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  if (!user) {
    return <div>Por favor, inicia sesión para ver tu perfil.</div>;
  }

  const renderGameCard = (game) => (
    <div key={game.id} className="game-card">
      <h4>{game.titulo}</h4>
      <div className="game-meta">
        <span>{game.plataforma}</span>
        {game.genero && <span>· {game.genero}</span>}
      </div>
      <p>{game.descripcion.substring(0, 100)}...</p>
      <div className="game-stats">
        <span>👍 {game.likes || 0}</span>
        <span>💬 {game.comentarios?.length || 0}</span>
      </div>
    </div>
  );

  const renderCommentCard = (comment) => (
    <div key={comment.id} className="comment-card">
      <div className="comment-game">En: {comment.gameTitle}</div>
      <p>{comment.texto}</p>
      <div className="comment-meta">
        <span>{"⭐".repeat(comment.calificacion)}</span>
        <span>{new Date(comment.fecha).toLocaleDateString()}</span>
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={user.foto || 'https://via.placeholder.com/150'} 
          alt={user.nombre} 
          className="profile-avatar"
        />
        <h2>{user.nombre}</h2>
        <div className="profile-stats">
          <div className="stat-item">
            <h3>Juegos Publicados</h3>
            <p>{games.length}</p>
          </div>
          <div className="stat-item">
            <h3>Comentarios</h3>
            <p>{userComments.length}</p>
          </div>
          <div className="stat-item">
            <h3>Favoritos</h3>
            <p>{favorites.length}</p>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          Mis Juegos
        </button>
        <button 
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Mis Comentarios
        </button>
        <button 
          className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Mis Favoritos
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'games' && (
          <div className="games-grid">
            {games.length === 0 ? (
              <p>Aún no has publicado ningún juego.</p>
            ) : (
              <div className="games-list">
                {games.map(renderGameCard)}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'comments' && (
          <div className="comments-grid">
            {userComments.length === 0 ? (
              <p>Aún no has hecho ningún comentario.</p>
            ) : (
              <div className="comments-list">
                {userComments.map(renderCommentCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="games-grid">
            {favorites.length === 0 ? (
              <p>Aún no has guardado ningún juego como favorito.</p>
            ) : (
              <div className="games-list">
                {favorites.map(renderGameCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
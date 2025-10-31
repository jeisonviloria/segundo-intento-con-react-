import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  setPersistence, 
  browserLocalPersistence,
  signOut,
  getAuth
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Configurar la persistencia de la sesión
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error al configurar la persistencia:', error);
});

class AuthError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export const authErrors = {
  'auth/popup-closed-by-user': 'Se cerró la ventana de inicio de sesión',
  'auth/cancelled-popup-request': 'Se canceló la solicitud de inicio de sesión',
  'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
  'auth/user-not-found': 'No se encontró la cuenta',
  'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
  'auth/timeout': 'La operación excedió el tiempo límite. Intenta de nuevo.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde.'
};

export const authenticateWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    // Establecer un tiempo límite para la autenticación
    const authPromise = signInWithPopup(auth, provider);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new AuthError('auth/timeout', 'La operación excedió el tiempo límite')), 30000)
    );

    const result = await Promise.race([authPromise, timeoutPromise]);
    const user = result.user;

    if (!user) {
      throw new AuthError('auth/no-user-data', 'No se pudo obtener la información del usuario');
    }

    // Crear o actualizar el documento del usuario en Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        nombre: user.displayName,
        email: user.email,
        foto: user.photoURL,
        fechaCreacion: new Date().toISOString(),
        ultimoAcceso: new Date().toISOString(),
        favoritos: [],
        juegosPublicados: []
      });
    } else {
      // Actualizar último acceso
      await setDoc(userRef, {
        ultimoAcceso: new Date().toISOString()
      }, { merge: true });
    }

    return {
      id: user.uid,
      nombre: user.displayName,
      email: user.email,
      foto: user.photoURL
    };

  } catch (error) {
    console.error('Error de autenticación:', error);
    const errorMessage = authErrors[error.code] || error.message;
    throw new AuthError(error.code || 'auth/unknown', errorMessage);
  }
};

export const cerrarSesion = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw new AuthError('auth/signout-failed', 'Error al cerrar sesión');
  }
};
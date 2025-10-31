import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { authenticateWithGoogle, cerrarSesion } from '../firebase/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          id: user.uid,
          nombre: user.displayName,
          email: user.email,
          foto: user.photoURL
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error en auth state:', error);
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const userData = await authenticateWithGoogle();
      setUser(userData);
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await cerrarSesion();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    user,
    loading,
    error,
    login,
    logout
  };
}
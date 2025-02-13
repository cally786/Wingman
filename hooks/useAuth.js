import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import { NotificationsService } from '../services/notifications';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar sesión actual
    checkUser();
    
    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Configurar notificaciones si el usuario inició sesión
      if (currentUser) {
        try {
          const token = await NotificationsService.setupPushNotifications();
          if (token) {
            await supabase
              .from('user_settings')
              .upsert({
                user_id: currentUser.id,
                push_token: token,
                notifications_enabled: true
              });
          }
        } catch (error) {
          console.error('Error configurando notificaciones:', error);
        }
      }
      
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Configurar notificaciones si hay sesión activa
      if (currentUser) {
        try {
          const token = await NotificationsService.setupPushNotifications();
          if (token) {
            await supabase
              .from('user_settings')
              .upsert({
                user_id: currentUser.id,
                push_token: token,
                notifications_enabled: true
              });
          }
        } catch (error) {
          console.error('Error configurando notificaciones:', error);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, ...metadata }) => {
    try {
      setLoading(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (signUpError) throw signUpError;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
}; 
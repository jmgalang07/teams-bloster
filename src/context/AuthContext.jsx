import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  refreshAuthSession,
  signInWithPassword,
  signOutAuth,
  supabaseRpc,
} from '../lib/supabaseClient';

const AuthContext = createContext(null);
const STORAGE_KEY = 'teams-bloster-admin-session';
const REFRESH_MARGIN_SECONDS = 60;

const getExpiresAt = (session) => {
  if (session?.expires_at) {
    return Number(session.expires_at);
  }

  if (session?.expires_in) {
    return Math.floor(Date.now() / 1000) + Number(session.expires_in);
  }

  return Math.floor(Date.now() / 1000) + 3600;
};

const normalizeSession = (session) => ({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
  token_type: session.token_type || 'bearer',
  expires_in: Number(session.expires_in) || 3600,
  expires_at: getExpiresAt(session),
  user: session.user || null,
});

const readStoredSession = () => {
  try {
    const rawSession = window.localStorage.getItem(STORAGE_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
};

const persistSession = (session) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

const clearStoredSession = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};

const getFriendlyAuthError = (error) => {
  const message = error?.message || '';

  if (/invalid login credentials/i.test(message)) {
    return 'Correo o contrasena incorrectos.';
  }

  if (/email not confirmed/i.test(message)) {
    return 'El correo aun no esta confirmado en Supabase. En Authentication > Users confirma el usuario.';
  }

  if (/is_admin|schema cache|function|PGRST202|PGRST/i.test(message)) {
    return 'Falta aplicar la configuracion SQL de administradores. Ejecuta supabase/admin-auth.sql en el SQL Editor de Supabase.';
  }

  return message || 'No se ha podido iniciar sesion.';
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState('loading');
  const [authError, setAuthError] = useState(null);

  const clearSession = useCallback(async ({ callLogout = false } = {}) => {
    const token = readStoredSession()?.access_token;

    if (callLogout && token) {
      try {
        await signOutAuth(token);
      } catch {
        // Aunque Supabase no responda, limpiamos la sesion local para cerrar el panel.
      }
    }

    clearStoredSession();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setStatus('guest');
  }, []);

  const verifyAdminSession = useCallback(async (nextSession) => {
    if (!nextSession?.access_token) {
      await clearSession();
      return false;
    }

    const adminResult = await supabaseRpc('is_admin', {}, { authToken: nextSession.access_token });
    const nextIsAdmin = Boolean(adminResult);

    setSession(nextSession);
    setUser(nextSession.user || null);
    setIsAdmin(nextIsAdmin);
    setStatus(nextIsAdmin ? 'admin' : 'guest');

    if (nextIsAdmin) {
      persistSession(nextSession);
    } else {
      clearStoredSession();
    }

    return nextIsAdmin;
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    const storedSession = readStoredSession();

    if (!storedSession?.refresh_token) {
      await clearSession();
      return null;
    }

    try {
      const refreshed = normalizeSession(await refreshAuthSession(storedSession.refresh_token));
      const sessionWithUser = {
        ...refreshed,
        user: refreshed.user || storedSession.user || null,
      };

      await verifyAdminSession(sessionWithUser);
      return sessionWithUser;
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
      await clearSession();
      return null;
    }
  }, [clearSession, verifyAdminSession]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const storedSession = readStoredSession();

      if (!storedSession?.access_token) {
        if (isMounted) {
          setStatus('guest');
        }
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = Number(storedSession.expires_at) || 0;

      try {
        const activeSession = expiresAt - REFRESH_MARGIN_SECONDS <= now
          ? await refreshAuthSession(storedSession.refresh_token).then(normalizeSession)
          : storedSession;

        if (!isMounted) {
          return;
        }

        await verifyAdminSession({
          ...activeSession,
          user: activeSession.user || storedSession.user || null,
        });
      } catch (error) {
        if (isMounted) {
          setAuthError(getFriendlyAuthError(error));
          await clearSession();
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [clearSession, verifyAdminSession]);

  useEffect(() => {
    if (!session?.refresh_token || !session?.expires_at) {
      return undefined;
    }

    const refreshInMs = Math.max(
      30_000,
      (Number(session.expires_at) - Math.floor(Date.now() / 1000) - REFRESH_MARGIN_SECONDS) * 1000,
    );

    const timer = window.setTimeout(() => {
      refreshSession();
    }, refreshInMs);

    return () => window.clearTimeout(timer);
  }, [refreshSession, session]);

  const signIn = useCallback(
    async ({ email, password }) => {
      setStatus('loading');
      setAuthError(null);

      try {
        const nextSession = normalizeSession(await signInWithPassword({ email, password }));
        const nextIsAdmin = await verifyAdminSession(nextSession);

        if (!nextIsAdmin) {
          try {
            await signOutAuth(nextSession.access_token);
          } catch {
            // Si falla el cierre remoto, igualmente limpiamos la sesion local.
          }

          await clearSession();
          throw new Error('Este correo existe en Auth, pero no esta autorizado como administrador. Anade su email a public.admin_users.');
        }

        return nextSession;
      } catch (error) {
        const friendlyError = getFriendlyAuthError(error);
        setAuthError(friendlyError);
        setStatus('guest');
        throw new Error(friendlyError);
      }
    },
    [clearSession, verifyAdminSession],
  );

  const signOut = useCallback(async () => {
    setAuthError(null);
    await clearSession({ callLogout: true });
  }, [clearSession]);

  const value = useMemo(
    () => ({
      authToken: session?.access_token || '',
      authError,
      isAdmin,
      isLoadingAuth: status === 'loading',
      session,
      signIn,
      signOut,
      status,
      user,
    }),
    [authError, isAdmin, session, signIn, signOut, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}

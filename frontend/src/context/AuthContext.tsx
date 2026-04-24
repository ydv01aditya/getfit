import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api, setToken, setSessionToken, getToken, getSessionToken } from "../api/client";

export type User = {
  user_id: string;
  email: string;
  name: string;
  picture?: string | null;
  auth_provider?: string;
  height_cm?: number;
  weight_kg?: number;
  goal?: string;
  target_weight_kg?: number;
};

type AuthState = {
  user: User | null | undefined; // undefined = loading
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  exchangeGoogleSession: (sessionId: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (u: User) => void;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  const loadMe = useCallback(async () => {
    try {
      const jwt = await getToken();
      const sess = await getSessionToken();
      if (!jwt && !sess) {
        setUser(null);
        return;
      }
      const me = await api<User>("/auth/me");
      setUser(me);
    } catch {
      await setToken(null);
      await setSessionToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const signIn = async (email: string, password: string) => {
    const res = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await setToken(res.token);
    setUser(res.user);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const res = await api<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: { email, password, name },
      auth: false,
    });
    await setToken(res.token);
    setUser(res.user);
  };

  const exchangeGoogleSession = async (sessionId: string) => {
    const res = await api<{ user: User; session_token: string }>(
      "/auth/google/session",
      {
        method: "POST",
        body: { session_id: sessionId },
        auth: false,
      }
    );
    await setSessionToken(res.session_token);
    setUser(res.user);
  };

  const signOut = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      /* noop */
    }
    await setToken(null);
    await setSessionToken(null);
    setUser(null);
  };

  const updateUser = (u: User) => setUser(u);

  return (
    <AuthCtx.Provider
      value={{
        user,
        signIn,
        signUp,
        exchangeGoogleSession,
        signOut,
        refresh: loadMe,
        updateUser,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

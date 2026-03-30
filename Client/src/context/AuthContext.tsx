import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  must_change_password: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (user: AuthUser, token: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Reads initial state from localStorage so the session survives a page refresh
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token")
  );

  const persist = (u: AuthUser, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("auth_user", JSON.stringify(u));
    localStorage.setItem("auth_token", t);
  };

  const login = (u: AuthUser, t: string) => persist(u, t);
  const updateUser = (u: AuthUser, t: string) => persist(u, t);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

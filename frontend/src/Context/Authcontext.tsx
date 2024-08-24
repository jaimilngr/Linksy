import React, { useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AuthProps {
  children: ReactNode;
}

interface AuthContextType {
  authUser: string | null;
  isLoggedIn: boolean;
  role: string | null;
  signOut: () => void;
  setAuthState: (authState: AuthState) => void;
}

interface AuthState {
  authUser: string | null;
  isLoggedIn: boolean;
  role: string | null;
  token: string | null;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProps) {
  const [authUser, setAuthUser] = useState<string | null>(Cookies.get('authUser') || null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!Cookies.get('token'));
  const [role, setRole] = useState<string | null>(Cookies.get('role') || null);

  useEffect(() => {
    const user = Cookies.get('authUser');
    const token = Cookies.get('token');
    const role = Cookies.get('role');
    setAuthUser(user || null);
    setIsLoggedIn(!!token);
    setRole(role || null);
  }, []);

  const signOut = () => {
    Cookies.remove('token');
    Cookies.remove('authUser');
    Cookies.remove('role');
    setAuthUser(null);
    setIsLoggedIn(false);
    setRole(null);
  };

  const setAuthState = (authState: AuthState) => {
    setAuthUser(authState.authUser);
    setIsLoggedIn(authState.isLoggedIn);
    setRole(authState.role);
    Cookies.set('authUser', authState.authUser || '', { expires: 10 });
    Cookies.set('token', authState.token || '', { expires: 10 }); 
    Cookies.set('role', authState.role || '', { expires: 10 });
  };

  const value = {
    authUser,
    isLoggedIn,
    role,
    signOut,
    setAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

import React, { useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

const AuthContext = React.createContext<AuthContextType | null>(null);

interface AuthProps {
  children: ReactNode;
}

interface AuthContextType {
  authUser: string | null;
  isLoggedIn: boolean;
  signOut: () => void;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }: AuthProps) {
  const [authUser, setAuthUser] = useState<string | null>(Cookies.get('authUser') || null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!Cookies.get('token'));

  useEffect(() => {
    const user = Cookies.get('authUser');
    const token = Cookies.get('token');
    setAuthUser(user || null);
    setIsLoggedIn(!!token);
  }, []);


  const signOut = () => {
    Cookies.remove('token');
    Cookies.remove('authUser');
    setAuthUser(null);
    setIsLoggedIn(false);
  };
  const value = {
    authUser,
    isLoggedIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

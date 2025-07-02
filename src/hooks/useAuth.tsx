import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// User type definition
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // In a real app, you would validate the token with your API
          // For now, we'll just simulate a user
          const mockUser: User = {
            id: '1',
            email: 'user@example.com',
            name: 'John Doe',
            role: 'user',
          };
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API here
      // For now, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const mockUser: User = {
        id: '1',
        email,
        name: 'John Doe',
        role: 'user',
      };

      setUser(mockUser);
      localStorage.setItem('auth_token', 'mock_token_123');
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const mockUser: User = {
        id: '1',
        email,
        name,
        role: 'user',
      };

      setUser(mockUser);
      localStorage.setItem('auth_token', 'mock_token_123');
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

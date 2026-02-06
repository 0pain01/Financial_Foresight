import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  getUserInitials: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize with demo user for now
    // In a real app, this would come from authentication
    setUser({
      id: 1,
      username: 'demo',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User'
    });
  }, []);

  const getUserInitials = () => {
    if (!user) return 'U';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  return (
    <UserContext.Provider value={{ user, setUser, getUserInitials }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
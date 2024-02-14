import React, { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import socket from '../utils/socket';

interface User {
  _id: string;
  username: string;
  img_url: string;
  token: string;
}

interface UserContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {}
});

const setUser = (userData: User) => ({
  user: userData,
});


const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    
    if(localStorage.getItem('auth_token')) {
        const token = localStorage.getItem('auth_token');
        if(!socket.connected) {
          socket.auth = {
            token
          }
          socket.connect();
        }
        
        
        socket.on('user', (userData: User) => {
          //console.log(userData);
          if(userData.token) {
            localStorage.setItem('auth_token', userData.token);
          }
          
          setUserState(userData);
        });
       
        return () => {
            socket.off('user');
        };
    }
    
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser: setUserState }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export { UserProvider, useUser, setUser };

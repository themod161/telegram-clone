import React, { ReactNode, createContext, useContext, useState } from 'react';
import { IChat } from '../types/types';

const SelectedChatContext = createContext<{
    selectedChat: IChat | null;
    setSelectedChat: React.Dispatch<React.SetStateAction<IChat | null>>;
}>({
    selectedChat: null,
    setSelectedChat: () => { }
});

export const SelectedChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);

  return (
    <SelectedChatContext.Provider value={{ selectedChat, setSelectedChat }}>
      {children}
    </SelectedChatContext.Provider>
  );
};

export const useSelectedChat = () => useContext(SelectedChatContext);
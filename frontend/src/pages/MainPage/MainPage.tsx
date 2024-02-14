import { useEffect, useRef, useState } from 'react';
import './MainPage.css';
import socket from '../../utils/socket';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChatsList } from '../../components/ChatsList/ChatsList';
import { SelectedChat } from '../../components/SelectedChat/SelectedChat';
import { SelectedChatProvider } from '../../stores/SelectedChat';
import { IChat, IMessage } from '../../types/types';
import { ChatUrl } from '../../components/ChatUrl/ChatUrl';
import { useUser } from '../../stores/User';
export default function MainPage() {
    let [chats, setChats] = useState<IChat[]>([]);
    let userContext = useUser();
    
    useEffect(() => {
        //console.log({socket});
        socket.onAny(console.log);
        socket.on('chats', (data: IChat[]) => {
            setChats(prevChats => {
                let updatedChats = [...prevChats];

                data.forEach(newChat => {
                    const existingChatIndex = updatedChats.findIndex(chat => chat._id === newChat._id);
                    if (existingChatIndex !== -1) {
                        updatedChats[existingChatIndex] = newChat;
                    } else {
                        updatedChats.push(newChat);
                    }
                });
                
                return updatedChats;
            });
        });
    
        socket.on('chatsList:chat', (data: IChat) => {
            let usr = data.users.find(user => user.user_id._id === userContext.user?._id);
            if(usr && usr.permissions.banned) {
                setChats(prevChats => prevChats.filter(chat => chat._id !== data._id));
            }
            else setChats(prevChats => {
                const chatIndex = prevChats.findIndex(chat => chat._id === data._id);
                if (chatIndex !== -1) {
                    const updatedChats = [...prevChats];
                    updatedChats[chatIndex] = data;
                    return updatedChats;
                } else {
                    return [...prevChats, data];
                }
            });
        });
        
        socket.on('message', (data:any) => {
            //console.log(data);
        });
        socket.on('chatsList:message', (data: {message: IMessage, chat_id: string}) => {
            //console.log("Received message data:", data);
            setChats(prevChats => {
                return prevChats.map(chat => {
                    if (chat._id === data.chat_id) {
                        return {
                            ...chat,
                            messages: [...chat.messages, data.message]
                        };
                    }
                    return chat;
                }).sort((a, b) => {
                    const aTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].createdAt).getTime() : 0;
                    const bTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].createdAt).getTime() : 0;
                    return bTime - aTime;
                });
            });
        });

        //console.log(socket.active)
    
        return () => {
            socket.off('chats');
            socket.off('chatsList:message');
            socket.off('chatsList:chat');
            socket.offAny(console.log);
        };
    }, []);

    
    return <>
    
        <div className="main-page-inner">
            <SelectedChatProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<>
                            <ChatsList chats={chats} />
                            <SelectedChat />
                        </>} />
                        <Route path="/c/:id" element={<ChatUrl />} />
                    </Routes>
                </Router>
            </SelectedChatProvider>
        </div>
    </>
}
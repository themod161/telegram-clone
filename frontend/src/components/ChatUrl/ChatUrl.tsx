import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Импорт хука useParams для извлечения параметров из URL
import socket from '../../utils/socket';

export const ChatUrl = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 

    useEffect(() => {
        if(socket.connected) {
            socket.emit('getChatByUrl', {
                chat_url: id,
            });
            navigate('/');
        }
        
        
        
    }, [id, socket]);

    return (
        <div className="chat-url">
            {/* Ваше содержимое чата */}
        </div>
    );
};

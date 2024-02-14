import { useEffect, useRef, useState } from "react"
import { useSelectedChat } from "../../stores/SelectedChat";
import socket from "../../utils/socket";
import { IChat, IMessage } from '../../types/types';
import { useUser } from "../../stores/User";
import ContentEditable from "react-contenteditable";
import { Campaign, Groups, Send } from '@mui/icons-material';
import { Modal } from "./Modal";
export function SelectedChat() {
    let {selectedChat, setSelectedChat} = useSelectedChat();
    let userContext = useUser();
    const chatMessagesRef = useRef<any>(null);
    const [html, setHtml] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };
    
    const closeModal = () => {
        setIsOpen(false);
    };

    const handleChange = (evt:any) => {
        setHtml(evt.target.value);
    };

    const handleBlur = (evt:any) => {
        
    };
    const scrollToBottom = () => {
        if (chatMessagesRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
            if (scrollHeight - scrollTop - clientHeight <= 150) {
                chatMessagesRef.current.scrollTop = scrollHeight+1000;
            }
        }
    };
    useEffect(()=> {
        socket.on('selectedChat:message', (data: {message: IMessage, chat_id: string}) => {
            if(data.chat_id === selectedChat?._id) {
                setSelectedChat((prev:any) => ({...prev, messages: [...prev.messages, data.message]}));
                scrollToBottom();
            }
        });
        socket.on('selectedChat:chat', (data: IChat) => {
            if(data._id === selectedChat?._id) {
                let usr = data.users.find(user => user.user_id._id === userContext.user?._id);
                if(usr && usr.permissions.banned) {
                    setSelectedChat(null);
                }
                else {
                    setSelectedChat(data);
                    scrollToBottom();
                }
            }
        });
        return () => {
            socket.off('selectedChat:message');
        }
    }, [selectedChat]);

    const handleSendMessage = () => {
        if(!selectedChat) return;
        socket.emit('newMessage', {
            chat_id: selectedChat._id,
            message: {
                type: 'text',
                data: html
            }
        });
        setHtml("");
        
    }

    return selectedChat != null ? <>
        <div className="selected-chat-inner">
            <Modal isOpen={isOpen} onClose={closeModal} />
            <div className="selected-chat-header" onClick={openModal}>
                <div className="selected-chat-header-info-inner">
                    <div className="selected-chat-header-info-img">
                        {
                            selectedChat.type === 'private' 
                                ? selectedChat.users.find(user => user.user_id._id !== userContext.user?._id)?.user_id?.img_url 
                                    ? <img src={selectedChat.users.find(user => user.user_id._id !== userContext.user?._id)?.user_id.img_url} alt=""/> 
                                    : <>{selectedChat.users.find(user => user.user_id._id!== userContext.user?._id)?.user_id.username.at(0)?.toUpperCase()}</>
                                : selectedChat.img_url 
                                    ? <img src={selectedChat.img_url} alt=""/> 
                                    : selectedChat.name.at(0)?.toUpperCase()
                        }

                    </div>
                    <div className="selected-chat-header-info">
                        <div className="selected-chat-header-info-name">{selectedChat.type == 'chat' ? <Groups /> : selectedChat.type == 'channel' ? <Campaign /> : '' } {selectedChat.name}</div>
                        <div className="selected-chat-header-info-members">
                            {selectedChat.users.filter(x=> !x.permissions.banned).length} member{selectedChat.users.filter(x=> !x.permissions.banned).length == 1 ? '' : 's'}
                        </div>
                    </div>
                </div>
                
            </div>
            <div className="selected-chat-messages custom-scrollbar" ref={chatMessagesRef}>
                {selectedChat.messages.map((message: IMessage) => (
                    <div className={`selected-chat-message${message.from._id == userContext.user?._id ? ' me' : ''}`} key={message._id} id={message._id}>
                            {message.from._id !== userContext.user?._id ? 
                                <div className="selected-chat-user-img selected-chat-header-info-img">
                                    {
                                        selectedChat?.type == 'channel' ? 
                                            selectedChat?.img_url
                                            ? <img src={selectedChat?.img_url} alt=""/> 
                                            : <>{selectedChat?.name.at(0)?.toUpperCase()}</>
                                        : message.from.img_url
                                            ? <img src={message.from.img_url} alt=""/> 
                                            : <>{message.from.username.at(0)?.toUpperCase()}</>
                                    }
                                </div>
                            : <></>}
                            
                            <div className="selected-chat-message-header">
                                <div className="selected-chat-message-header-title">
                                    {message.from._id == userContext.user?._id ? <span></span> : <span className="selected-chat-message-header-username">{selectedChat?.type === "channel" ? selectedChat?.name  : message.from.username}</span>}
                                    <span className="selected-chat-message-header-timestamp">{
                                        new Date(message.createdAt).toLocaleString('en-US', {
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            hour12: false
                                        })
                                    }</span>
                                </div>
                                <div className="selected-chat-message-body">
                                    {message.type === 'text'? message.data : <img src={message.data} alt=""/>}
                                </div>
                            </div>              
                    </div>
                ))}
            </div>
            <div className="selected-chat-input-inner">
                {selectedChat?.type === 'channel' && selectedChat?.users?.find((user:any)=> user.user_id._id == userContext.user?._id)?.role === 'user' ? <></> :<>
                    <ContentEditable
                        html={html}
                        disabled={false}
                        onInput={handleChange}
                        onChange={handleChange}
                        className="selected-chat-input"
                        onBlur={handleBlur}
                        data-ph={'Enter your message here'}
                    />

                    <div className="selected-chat-input-sumbit" onClick={handleSendMessage}>
                        <Send />
                    </div>
                </>}
            </div>
            
        </div>
    </> 
    : <></>
}
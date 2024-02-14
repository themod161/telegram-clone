import { Add, ArrowBack, Campaign, Groups, PlusOne } from "@mui/icons-material";
import { useSelectedChat } from "../../stores/SelectedChat";
import { useUser } from "../../stores/User";
import { IChat } from '../../types/types';
import { useState } from "react";
import { ChatCreation } from "../ChatCreation/ChatCreation";

export function ChatsList(props: { chats: IChat[] }) {
    let {chats} = props;
    let userContext = useUser();
    const { selectedChat, setSelectedChat } = useSelectedChat();
    const [creatingChat, setCreatingChat] = useState(false);
    return <>
        <div className="chats-list-inner">
            {!creatingChat ? <>
                <div className="chat-search-chats">
                    <input type="text" name="" id="" placeholder="Search"/>
                </div>
                <div className="chats-list">
                    {chats.map((chat: IChat) => (
                        <div className="chat-item" key={chat.name} onClick={()=> selectedChat?._id != chat._id && setSelectedChat(chat)}>
                            <div className="chat-item-image">
                                {chat.img_url ? <img src={chat.img_url} alt=""/> : <>{chat.name.at(0)?.toUpperCase()}</>}
                            </div>
                            <div className="chat-item-header">
                                <div className="chat-item-header-title">
                                    {chat.type == 'chat' ? <Groups /> : chat.type == 'channel' ? <Campaign /> : '' } {chat.name}
                                </div>
                                <div className="chat-item-last-message">
                                    {chat.messages.length > 0 ?
                                    chat.type === 'channel' ? chat.messages[chat.messages.length - 1].type === 'text' && chat.messages[chat.messages.length - 1].data :
                                        chat.messages[chat.messages.length - 1].from._id === userContext.user?._id ? `You: ${chat.messages[chat.messages.length - 1].data}` : `${chat.messages[chat.messages.length - 1].from.username}: ${chat.messages[chat.messages.length - 1].data}`
                                    : <>No messages</>}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="chats-list-create-chat" onClick={()=> setCreatingChat(true)}>
                        <Add />
                    </div>
                </div>
            </> : <>
                <ChatCreation onBack={()=> setCreatingChat(false)} />
            </>}
        </div>
    </>
}
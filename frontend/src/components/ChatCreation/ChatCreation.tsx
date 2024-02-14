import { ArrowBack, Campaign, Groups } from "@mui/icons-material";
import { useState } from "react";
import socket from "../../utils/socket";

export function ChatCreation(props: { onBack: () => void}) {
    let [selectedType, setSelectedType] = useState('');

    let [chatName, setChatName] = useState('');
    let [chatDescription, setChatDescription] = useState('');
    let [chatImgUrl, setChatImgUrl] = useState('');
    let [chatLink, setChatLink] = useState('');

    return <>
        <div className="chat-creation-inner">
            <div className="chat-createion-header-inner">
                
                {selectedType 
                ? <>
                    <div className="chat-createion-header">
                        <div className="chat-createion-header-back" onClick={()=> {
                            setSelectedType('')
                            setChatName('');
                            setChatDescription('');
                            setChatImgUrl('');
                            setChatLink('');
                        }}>
                            <ArrowBack />
                        </div>
                        <div className="chat-createion-header-title">
                            {selectedType.at(0)?.toUpperCase() + selectedType.substring(1)} 
                        </div>
                    </div>
                    <div className="chat-createion-body">
                        <div className="chat-createion-body-input-group">
                            <div className="chat-createion-body-input-group-title">
                                Name: (*)
                            </div>
                            <div className="chat-createion-body-input-group-input">
                                <input
                                    value={chatName}
                                    placeholder="Enter chat name"
                                    onChange={ev => setChatName(ev.target.value)}
                                    className={"inputBox"} />
                            </div>
                        </div>
                        <div className="chat-createion-body-input-group">
                            <div className="chat-createion-body-input-group-title">
                                Description:
                            </div>
                            <div className="chat-createion-body-input-group-input">
                                <input
                                    value={chatDescription}
                                    placeholder="Enter chat description"
                                    onChange={ev => setChatDescription(ev.target.value)}
                                    className={"inputBox"} />
                            </div>
                        </div>
                        <div className="chat-createion-body-input-group">
                            <div className="chat-createion-body-input-group-title">
                                Image URL:
                            </div>
                            <div className="chat-createion-body-input-group-input">
                                <input
                                    value={chatImgUrl}
                                    placeholder="Enter image URL"
                                    onChange={ev => setChatImgUrl(ev.target.value)}
                                    className={"inputBox"} />
                            </div>
                        </div>
                        <div className="chat-createion-body-input-group">
                            <div className="chat-createion-body-input-group-title">
                                Public Url: (*) 
                            </div>
                            <div className="chat-createion-body-input-group-input">
                                <input
                                    value={chatLink}
                                    placeholder="Enter link"
                                    onChange={ev => setChatLink(ev.target.value)}
                                    className={"inputBox"} />
                            </div>
                        </div>

                        <div className="chat-createion-body-button-create" onClick={()=> {
                                if (chatName && chatLink) {
                                    socket.emit('createChat', {
                                        name: chatName,
                                        desc: chatDescription,
                                        img_url: chatImgUrl,
                                        link: chatLink,
                                        type: selectedType
                                    });
                                    props.onBack();
                                }
                            }}>
                                Create
                        </div>
                    </div>
                </> 
                
                : <>
                <div className="chat-createion-header">
                    <div className="chat-createion-header-back" onClick={props.onBack}>
                        <ArrowBack />
                    </div>
                    <div className="chat-createion-header-title">
                        Create Chat
                    </div>
                </div>
                <div className="chat-createion-header-type">
                    <div className="chat-createion-header-type-item" onClick={()=> setSelectedType('chat')}>
                        <div className="chat-createion-header-type-item-icon">
                            <Groups />
                        </div>
                        <div className="chat-createion-header-type-item-title">
                            Chat
                        </div>
                    </div>
                    <div className="chat-createion-header-type-item" onClick={()=> setSelectedType('channel')}>
                        <div className="chat-createion-header-type-item-icon">
                            <Campaign />
                        </div>
                        <div className="chat-createion-header-type-item-title">
                            Channel
                        </div>
                    </div>
                    
                </div>
                </>}
            </div>
        </div>
    </>;
}

import { useEffect, useRef, useState } from 'react';
import './Modal.css';
import { useSelectedChat } from '../../stores/SelectedChat';
import { useUser } from '../../stores/User';
import { Campaign, Groups, PersonRemove, RemoveCircleOutline } from '@mui/icons-material';
import socket from '../../utils/socket';
export const Modal = (props: { isOpen:boolean, onClose: ()=> void }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    let {selectedChat, setSelectedChat} = useSelectedChat();
    let userContext = useUser();
    const [banDuration, setBanDuration] = useState('5m');
    let [selectBanDuration, setSelectBanDuration] = useState(false);
    const durations = ['5m', '15m', '1h', '2h', '6h', '12h', '1d', '14d', '30d', 'forever'];
    let {isOpen, onClose} = props;
  

    const handleClickOutside = (event: any) => {
      if (modalRef.current && !(modalRef.current as any).contains(event.target)) {
        onClose();
      }
    };
  
    // Добавляем обработчик клика за пределами модального окна при открытии
    useEffect(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);
  

    if (!isOpen) {
      return null;
    }
    const handleDurationChange = (event:any, user_id: string) => {
        setBanDuration(event.target.value);
        setSelectBanDuration(false);
        socket.emit('banUser', {
            chat_id: selectedChat?._id,
            user_id,
            duration: event.target.value
        });
    };


    const handleClose = () => {
      onClose();
    };
  
    return (selectedChat ? 
      <div className="modal-overlay">
        <div ref={modalRef} className="modal">
          <button className="modal-close" onClick={handleClose}>X</button>
          <h2>{selectedChat?.type == 'channel' ? `About channel` : selectedChat?.type == 'chat' ? 'About chat' : 'About user'}</h2>
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
                        <div className="selected-chat-header-info-name">{selectedChat.name}</div>
                        <div className="selected-chat-header-info-members">
                            {selectedChat.users.filter(x=> !x.permissions.banned).length} member{selectedChat.users.filter(x=> !x.permissions.banned).length == 1 ? '' : 's'}
                        </div>
                    </div>
                    
            </div>
            {selectedChat.desc && <div className="modal-selected-chat-desc">Description:<br></br>{selectedChat.desc}</div>}
            <div className="modal-selected-chat-link">
                <div className="modal-selected-chat-link-title">Link:</div>
                <a href={`${window.location.origin}/c/${selectedChat.link}`} target="_blank" rel="noopener noreferrer">{window.location.origin}/c/{selectedChat.link}</a>
            </div>
            <div className="modal-selected-chat-users">
                <div className="modal-selected-chat-users-title">Users:</div>
                <div className="modal-selected-chat-users-list">
                    {selectedChat.users.filter(x=> !x.permissions.banned).map(user => (
                        <div className="modal-selected-chat-users-list-item" key={user.user_id._id}>
                            <div className="modal-selected-chat-users-info">
                                <div className="selected-chat-header-info-img">
                                    {
                                        user.user_id.img_url
                                                ? <img src={user.user_id.img_url} alt=""/> 
                                                : <>{user.user_id.username.at(0)?.toUpperCase()}</>
                                    }

                                </div>
                                <div className="modal-selected-chat-users-list-item-img">
                                    <img src={user.user_id.img_url} alt=""/>
                                </div>
                                <div className="modal-selected-chat-users-list-item-name">
                                    {user.user_id.username}
                                </div>
                            </div>
                            
                            {
                                user.user_id._id !== userContext.user?._id && selectedChat?.users.find(usr => usr.user_id._id === userContext.user?._id)?.role !== 'user' && user.role !== 'owner' && selectedChat?.type !== 'private' 
                                ?  <div className="modal-selected-chat-users-list-item-tools">
                                    
                                    <div className="modal-selected-chat-users-list-item-tools-item">
                                        {!selectBanDuration ? <div className="modal-selected-chat-users-list-item-tools-item-icon remove" onClick={()=> {
                                            setSelectBanDuration(true);
                                        }}>
                                             <RemoveCircleOutline /> 
                                        </div> :
                                            <div className="ban-duration-select">
                                                <select id="banDuration" value="select" onChange={(e:any) => handleDurationChange(e, user.user_id._id)}>
                                                    <option value="select" disabled={true}>Select</option>
                                                    {durations.map((duration) => (
                                                        <option key={duration} value={duration}>{duration}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        }
                                        
                                    </div>
                                </div>
                                : <></>
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    : <></>);
  };
import { Server, Socket } from "socket.io";
import { Database } from "../../database/Database";
import { ChatModel } from "../../database/models/Chat";
import { UserModel } from "../../database/models/User";
import jwt from "jsonwebtoken";
import { IChat, IServerUser, IServerUserWithoutCredentials, IUser } from '../../types/types';

export class SocketEventHandler {
    private io: Server;
    private userModel: typeof UserModel;
    private chatModel: typeof ChatModel;
    private database: Database;

    constructor(io: Server, database: Database) {
        this.io = io;
        this.database = database;
        this.userModel = database.getUserModel();
        this.chatModel = database.getChatModel();
    }

    public async handleConnection(socket: Socket): Promise<void> {
        //console.log('User connected:', socket.id);
        //console.log(socket.handshake.auth)
        let user: IServerUser | null = null;
        if (socket.handshake.auth.token) {
            let { token } = socket.handshake.auth;
            let dec = await new Promise<{ err: string | undefined, decoded: {
                id: string
            }}>((resolve, reject) => {
                jwt.verify(token, process.env.TOKEN_SECRET || '', (err: any, decoded: any) => {
                    resolve({ err: err?.message, decoded });
                });
            })
            //console.log(dec);
            if (dec.err == 'jwt expired') {
                user = await this.userModel.updateToken(token);
                if (user) {
                    let userJSON = (user as any).toJSON() as IServerUser;

                    let {password, updatedAt, createdAt, ...usr} = userJSON;
                    
                    socket.emit('user', usr)
                }
            }
            else if (dec.decoded && user == null) {
                user = await this.userModel.findUser(dec.decoded.id) as IServerUser;
                if (!user || user == null) console.log("User not found");
                else {
                    let userJSON = (user as any).toJSON() as IServerUser;
                    let {password, updatedAt, createdAt, ...usr} = userJSON;
                    socket.emit('user', usr)
                }
            }
            if (user) {
                this.handleSocketEvents(socket, user);
 
                let chats = await this.chatModel.getChats(user._id.toString());
                //console.log(chats);
                chats?.forEach(async (chat) => {
                    socket.join(chat._id.toString());
                });
                socket.join(user._id.toString());
                setTimeout(() => socket.emit('chats', chats || []), 100)
                
            }
        }

    }

    private handleSocketEvents(socket: Socket, user: IServerUser): void {
        socket.on('getChatByUrl', async (data: {
            chat_url: string
        }) => {
            let chat = await ChatModel.findOne({ link: data.chat_url });

            if(chat) 
            {
                let usr = chat?.users.find((usr:any) => usr.user_id.equals(user._id));
                if(!usr) 
                {
                    chat.users.push({
                        "permissions": {
                            "write": true,
                            "banned": false,
                            "muted": false,
                            "bannedTo": null,
                            "mutedTo": null
                        },
                        "role": "user",
                        "user_id": user._id
                    })
                    chat.save();
                    await chat.populate({
                        path: 'users.user_id',
                        select: '-password -token -__v'
                    })
                    await chat.populate({
                        path: 'messages.from',
                        select: '-password -token -__v'
                    })
                    socket.join(chat._id.toString());
                    this.io.to(chat._id.toString()).emit('chatsList:chat', chat);
                    this.io.to(chat._id.toString()).emit('selectedChat:chat', chat);
                }
                else if(usr.permissions.banned && usr.permissions.bannedTo != 0 && Date.parse(usr.permissions.bannedTo?.toString() || '1') < Date.now()) {
                    usr.permissions.banned = false;
                    usr.permissions.bannedTo = null;
                    chat.save();
                    socket.join(chat._id.toString());

                    await chat.populate({
                        path: 'users.user_id',
                        select: '-password -token -__v'
                    })
                    await chat.populate({
                        path: 'messages.from',
                        select: '-password -token -__v'
                    })
                    this.io.to(chat._id.toString()).emit('chatsList:chat', chat);
                    this.io.to(chat._id.toString()).emit('selectedChat:chat', chat);
                }
                else if(usr.permissions.banned) {
                    console.log("Remaining:", Math.round((Date.parse(usr.permissions.bannedTo?.toString() || '1') - Date.now())/1000));
                }
            }
        });

        socket.on('banUser', async (data: {
            chat_id: string,
            user_id: string,
            duration: '5m' | '15m' | '1h' | '2h' | '6h' | '12h' | '1d' | '14d' | '30d' | 'forever'
        }) => {
            let durationInMinutes: number;
            const durationString = data.duration;

            if (durationString === 'forever') {
                durationInMinutes = 0;
            } else {
                const value = parseInt(durationString);
                if (durationString.includes('m')) {
                    durationInMinutes = value;
                } else if (durationString.includes('h')) {
                    durationInMinutes = value * 60;
                } else if (durationString.includes('d')) {
                    durationInMinutes = value * 60 * 24;
                }
            }
            
            let chat = await ChatModel.findOne({ _id: data.chat_id });
            if (chat) {
                let user = await UserModel.findOne({ _id: data.user_id });
                if (user) {
                    chat.users = chat.users.map((usr: any) => {
                        if (usr.user_id.toString() === data.user_id) {
                            return {
                                ...usr,
                                permissions: {
                                    ...usr.permissions,
                                    banned: true,
                                    bannedTo: durationInMinutes == 0 ? 0 : new Date(Date.now() + durationInMinutes * 60 * 1000),
                                }
                            };
                        }
                        return usr;
                    });
                    await chat.save();
                }
                await chat.populate({
                    path: 'users.user_id',
                    select: '-password -token -__v'
                })
                await chat.populate({
                    path: 'messages.from',
                    select: '-password -token -__v'
                })
                delete chat['__v'];
                this.io.to(chat._id.toString()).emit('selectedChat:chat', chat);
                this.io.to(chat._id.toString()).emit('chatsList:chat', chat);
            }
            
        });

        socket.on('createChat', async (data: IChat) => {
            let res = await ChatModel.create({
                name: data.name,
                desc: data.desc,
                link: data.link,
                img_url: data.img_url,
                type: data.type,
                users: [ 
                    {
                        user_id: user._id,
                        role: "owner",
                        permissions: {
                            write: true,
                            banned: false,
                            bannedTo: null,
                            muted: false,
                            mutedTo: null
                        }
                    }
                ],
                messages: []
            });
            res.save();
            await res.populate({
                path: 'users.user_id',
                select: '-password -token -__v'
            })
            delete res['__v'];
            socket.join(res._id.toString());
            socket.emit('chatsList:chat', res);
        });
        socket.on('newMessage', async (data: {
            chat_id: string,
            message: {
                type: 'text' | 'image',
                data: string
            }
        }) => {
            if(user) {
                let chat = await ChatModel.findById(data.chat_id);
                if(chat) {
                    let message = {
                        from: user._id,
                        "data": data.message.data,
                        "type": data.message.type
                    }
                    
                    let m = chat.messages.push(message);
                    await chat.populate({
                        path: 'messages.from',
                        select: '-password -token -__v'
                    })
                    
                    chat.save();
                    //console.log(data.chat_id, chat._id, socket.rooms);
                    
                    let msg = chat.messages[m-1];
                    this.io.to(chat._id.toString()).emit('selectedChat:message', {
                        chat_id: chat._id.toString(),
                        message: msg
                    })
                    this.io.to(chat._id.toString()).emit('chatsList:message', {
                        chat_id: chat._id.toString(),
                        message: msg
                    })
                }
            }
        });
    }
}
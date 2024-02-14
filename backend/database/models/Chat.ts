import mongoose, { Schema, Document, Model, ObjectId } from 'mongoose';
import { IChat } from '../../types/types';


interface IChatModel extends Model<IChat> {
    getChatByUrl(chat_url: string): unknown;
    getChats(id: string): Promise<IChat[] | null>;
}
const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: false
    },
    type: {
        type: String,
        enum: ['chat', 'channel', 'private'],
        required: true
    },
    img_url: {
        type: String,
        required: false
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    messages: [
        {
            from: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            type: {
                type: String,
                enum: ['text', 'image'],
                required: true
            },
            data: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    users: [{
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
            type: String,
            enum: ['owner', 'admin', 'user'],
            default: 'user',
            required: true
        },
        permissions: {
            write: {
                type: Boolean,
                default: true
            },
            banned: {
                type: Boolean,
                default: false
            },
            bannedTo: {
                type: Date,
                default: null
            },
            muted: {
                type: Boolean,
                default: false
            },
            mutedTo: {
                type: Date,
                default: null
            }
        }
    }]
});


chatSchema.statics.getChats = async function(user_id: string): Promise<IChat[] | null> {
    try {
        const chats = await this.find({
            'users': {
                $elemMatch: {
                    'user_id': user_id,
                    'permissions.banned': { $ne: true }
                }
            }
        });
        
        return await Promise.all(chats.map(async (chat: any) => {
            //console.log("95", chat);
            await chat.populate({
                path: 'users.user_id',
                select: '-password -token -__v'
            })
            await chat.populate({
                path: 'messages.from', 
                select: '-password -token -__v'
            });
            chat.__v = undefined;
            
            return chat;
        })); 
    } catch (error) {
        console.error('Ошибка при поиске чатов:', error);
        return null;
    }
};

chatSchema.statics.getChatByUrl = async function(chat_url: string): Promise<IChat | null> {
    try {
        let chat = await ChatModel.findOne({ link: chat_url });
        if(!chat) return chat;
        await chat.populate({
            path: 'users.user_id',
            select: '-password -token -__v'
        })
        await chat.populate({
            path: 'messages.from', 
            select: '-password -token -__v'
        });
        chat.__v = undefined;
        return chat;
    } catch (error) {
        console.error('Ошибка при поиске чатов:', error);
        return null;
    }
};

const ChatModel = mongoose.model<IChat, IChatModel>('Chat', chatSchema);

export { ChatModel };
 
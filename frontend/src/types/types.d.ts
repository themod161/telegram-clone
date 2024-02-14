export interface IChatUser {
    user_id: IUser,
    role: 'owner' | 'admin' | 'user',
    permissions: {
        write: boolean,
        banned: boolean,
        bannedTo: Date,
        muted: boolean,
        mutedTo: Date
    }
}
export interface IUser {
    _id: string,
    username: string,
    img_url?: string,
}
export interface IChat {
    _id: string;
    name: string;
    desc?: string;
    img_url?: string;
    type: 'chat' | 'channel' | 'private',
    link: string;
    users: IChatUser[];
    messages: IMessage[];
}
export interface IMessage {
    _id: string,
    from: IUser,
    type: 'text' | 'image',
    data: string,
    createdAt: Date
}
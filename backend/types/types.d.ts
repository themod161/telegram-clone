export interface IUser {
    user_id: string,
    role: 'owner' | 'admin' | 'user',
    permissions: {
        write: boolean,
        banned: boolean,
        bannedTo: Date | null | 0,
        muted: boolean,
        mutedTo: Date | null
    }
}


export interface IServerUserWithoutCredentials {
    _id: string,
    token: string,
    username: string,
    createdAt?: Date,
    updatedAt?: Date
}

export interface IServerUser extends IServerUserWithoutCredentials {
    password: string,
}

export interface IMessage {
    from: string,
    type: 'text' | 'image',
    data: string,
    createdAt?: Date
}
export interface IChat {
    _id: string;
    name: string;
    desc?: string;
    type: 'chat' | 'channel' | 'private',
    link: string;
    img_url?: string;
    users: IUser[];
    messages: IMessage[];
}

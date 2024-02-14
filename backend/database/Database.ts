import mongoose, { Connection, Mongoose } from 'mongoose';
import { ChatModel } from './models/Chat';
import { UserModel } from './models/User';

export class Database {
    private mongoose: Mongoose;
    private connection: Connection;

    constructor() {
        this.mongoose = mongoose;
        this.connection = this.mongoose.connection;
        this.connect();
    }

    private connect(): void {
        this.mongoose.connect(process.env.MONGODB_URL || '');
        this.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
        this.connection.once('open', () => {
            console.log('MongoDB connected successfully.');
        });
    }

    public getChatModel(): typeof ChatModel {
        return ChatModel;
    }

    public getUserModel(): typeof UserModel {
        return UserModel;
    }
}


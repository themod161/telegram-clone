import express, { Application } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { Database } from '../../database/Database';
import { AuthController } from '../../controllers/AuthController';
import { SocketConfigurator } from '../Sockets/SocketConfiguration';

export class ChatServer {
    private app: Application;
    private server: http.Server;
    private io: Server;
    private database: Database;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        this.database = new Database();

        this.config();
        this.routes();
        this.socketEvents();
    }

    private config(): void {
        this.app.use(express.json());
        this.app.use(cors());
    }

    private routes(): void {
        this.app.post('/register', AuthController.registerUser);
        this.app.post('/login', AuthController.authenticateUser);
    }

    private socketEvents(): void {
        new SocketConfigurator(this.io, this.database);
    }

    public start(port: number): void {
        this.server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
}
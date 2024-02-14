import { Server, Socket } from "socket.io";
import { SocketEventHandler } from "./SocketEventHandler";
import { Database } from "../../database/Database";

export class SocketConfigurator {
    private io: Server;
    private database: Database;

    constructor(io: Server, database: Database) {
        this.io = io;
        this.database = database;
        this.configure();
    }

    public configure(): void {
        this.io.on('connection', async (socket: Socket) => {
            const socketEventHandler = new SocketEventHandler(this.io, this.database);
            await socketEventHandler.handleConnection(socket);
        });
    }
}
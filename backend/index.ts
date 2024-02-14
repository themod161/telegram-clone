require('dotenv').config();
import { ChatServer } from "./classes/ChatServer/ChatServer";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const chatServer = new ChatServer();
chatServer.start(PORT);
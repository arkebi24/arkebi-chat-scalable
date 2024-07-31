import { Server } from "socket.io";
import { Redis } from "ioredis";


const pub = new Redis({
    host: 'caching-arkebi-chat-26c312d-arkebi-chat.e.aivencloud.com',
    port: 19928,
    username: 'default',
    password: 'AVNS_gWIY_4U0TaHGq1EE5WM',
});
const sub = new Redis({
    host: 'caching-arkebi-chat-26c312d-arkebi-chat.e.aivencloud.com',
    port: 19928,
    username: 'default',
    password: 'AVNS_gWIY_4U0TaHGq1EE5WM',
});

class SocketService {
    private _io: Server;
    constructor() {
        console.log("Init Socket Service");

        this._io = new Server({
            cors: {
                allowedHeaders: ['*'],
                origin: '*',
            },
        });
        sub.subscribe("MESSAGE")
    }

    get io() {
        return this._io;
    }

    public initListners() {
        const io = this.io;
        console.log("Init listeners");

        io.on("connect", (socket) => {
            console.log(`New Socket Connected`, socket.id);

            socket.on("event:message", async ({ message }: { message: string }) => {
                console.log("New Message Received:", message);
                //publish this message to redis
                await pub.publish("MESSAGE", JSON.stringify({ message }));
            })

        });

        sub.on('message', (channel, message) => {
            if(channel === 'MESSAGE') {
                io.emit('message', message)
            }
        })
    }
}

export default SocketService;
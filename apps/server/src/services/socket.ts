import { Server } from "socket.io";
import { Redis } from "ioredis";
import prismaClient from "./prisma";
import { produceMessage } from "./kafka";
import secrets from '../../../../.secrets.json'; //YOUR OWN CREDENTIALS FOR REDIS, KAFKA AND POSTGRESQL


const pub = new Redis({
    host: secrets['redis_secrets']['host'],
    port: secrets['redis_secrets']['PORT'],
    username: secrets['redis_secrets']['username'],
    password: secrets['redis_secrets']['password'],
});
const sub = new Redis({
    host: secrets['redis_secrets']['host'],
    port: secrets['redis_secrets']['PORT'],
    username: secrets['redis_secrets']['username'],
    password: secrets['redis_secrets']['password'],
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

        sub.on('message', async (channel, message) => {
            if(channel === 'MESSAGE') {
                io.emit('message', message)
            }
            await produceMessage(message)
            console.log('Produced message to Kafka ("MESSAGES Topic")');
        })
    }
}

export default SocketService;
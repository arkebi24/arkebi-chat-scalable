import { Kafka, Producer } from "kafkajs";
import secrets from '../../../../.secrets.json'; //YOUR OWN CREDENTIALS FOR REDIS, KAFKA AND POSTGRESQL
import fs from 'fs';
import path from 'path';
import prismaClient from "./prisma";

const kafka = new Kafka({
    brokers: [secrets['kafka_secrets']['brokers']],
    ssl: {
        ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")]
    },
    sasl: {
        username: secrets['kafka_secrets']['username'],
        password: secrets['kafka_secrets']['password'],
        mechanism: 'plain',
    },
});

//cache producer
let producer: null | Producer = null;


export async function createProducer() {
    if(producer) 
        return producer;

    const _producer = kafka.producer()
    await _producer.connect()
    producer = _producer;
    return producer;
}

export async function produceMessage(message:string) {
    const producer = await createProducer();
    await producer.send({
        messages: [{key: `messaged-${Date.now()}`, value: message}],
        topic: "MESSAGES",
    });
}

export async function startConsumer() {
    const consumer = kafka.consumer({groupId: "default"});
    await consumer.connect();
    await consumer.subscribe({topic: "MESSAGES", fromBeginning: true});

    await consumer.run({
        autoCommit: true,
        eachMessage: async ({message, pause}) => {
            if(!message.value) return
            console.log('New Message Recieved..');
            try {
                await prismaClient.message.create({
                    data: {
                        text: message.value?.toString(),
                    },
                });
            } catch (err) {
                console.log('Error: ', err);
                pause();
                setTimeout(() => {
                    consumer.resume([{topic: "MESSAGES"}]);
                }, 60000)
            }
        }
    })
}

export default kafka;
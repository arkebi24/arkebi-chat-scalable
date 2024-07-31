import { Kafka, Producer } from "kafkajs";
import secrets from '../../../../.secrets.json'; //YOUR OWN CREDENTIALS FOR REDIS, KAFKA AND POSTGRESQL
import fs from 'fs';
import path from 'path';

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

export default kafka;
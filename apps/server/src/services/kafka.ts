import { Kafka, Producer } from "kafkajs";

const kafka = new Kafka({
    brokers: [],
})

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
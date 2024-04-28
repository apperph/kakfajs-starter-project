require('dotenv').config()
const ip = require("ip");

const {Kafka, CompressionTypes, logLevel} = require("kafkajs");

const hosts = {
    one: process.env.HOST_ONE || ip.address(),
    two: process.env.HOST_TWO || ip.address(),
}

const port = process.env.HOST_PORT || 9198;

const kafkaopts = {
	logLevel: logLevel.INFO,
	clientId: "advanceph-app",
    brokers: [`${hosts.one}:${port}`, `${hosts.two}:${port}`],
	ssl: true,
	sasl: {
        mechanism: "SCRAM-SHA-512",
        username: process.env.CLUSTER_USERNAME,
        password: process.env.CLUSTER_PASSWORD
	},
};

const kafka = new Kafka(kafkaopts);

const topic = "dev-kafka-topic";
const producer = kafka.producer();

const getRandomNumber = () => Math.round(Math.random(10) * 1000);
const createMessage = (num) => ({
	key: `key-${num}`,
	value: `value-${num}-${new Date().toISOString()} - Hello Work!`,
});

const sendMessage = () => {
	return producer
		.send({
			topic,
			compression: CompressionTypes.GZIP,
			messages: Array(1)
				.fill()
				.map((_) => createMessage(getRandomNumber())),
		})
		.then(console.log)
		.catch((e) => console.error(`[example/producer] ${e.message}`, e));
};

const run = async () => {
	await producer.connect();
    sendMessage();
	setInterval(sendMessage, 10000);
};

run().catch((e) => console.error(`[example/producer] ${e.message}`, e));

const errorTypes = ["unhandledRejection", "uncaughtException"];
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

errorTypes.forEach((type) => {
	process.on(type, async () => {
		try {
			console.log(`process.on ${type}`);
			await producer.disconnect();
			process.exit(0);
		} catch (_) {
			process.exit(1);
		}
	});
});

signalTraps.forEach((type) => {
	process.once(type, async () => {
		try {
			await producer.disconnect();
		} finally {
			process.kill(process.pid, type);
		}
	});
});

const kafka = require('./kafka');
const { CompressionTypes } = require('kafkajs')

const topic = process.env.KAFKA_TOPIC;
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
	setInterval(sendMessage, 60000);
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

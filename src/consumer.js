require('dotenv').config()
const ip = require("ip");

const {Kafka, logLevel} = require("kafkajs");

const hosts = {
    one: process.env.HOST_ONE || ip.address(),
    two: process.env.HOST_TWO || ip.address(),
}

const port = process.env.HOST_PORT || 9198;

const kafkaopts = {
	logLevel: logLevel.INFO,
	clientId: "advanceph-app",
    brokers: [`${hosts.one}:${port}`, `${hosts.two}:${port}`],
	// brokers: ['kafka1:9092', 'kafka2:9092'],
	// authenticationTimeout: 10000,
	// reauthenticationThreshold: 10000,
	ssl: true,
	sasl: {
        mechanism: "SCRAM-SHA-512",
        username: process.env.CLUSTER_USERNAME,
        password: process.env.CLUSTER_PASSWORD
		// mechanism: "aws",
		// authorizationIdentity: process.env.AWS_IAMUSER_ID, // UserId or RoleId
		// accessKeyId: process.env.AWS_ACCESS_ID,
		// secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
	},
};

console.log(kafkaopts)

const kafka = new Kafka(kafkaopts);

const topic = "dev-kafka-topic";
const consumer = kafka.consumer({groupId: "apper-group"});

const run = async () => {
	await consumer.connect();
	await consumer.subscribe({topic, fromBeginning: true});
	await consumer.run({
		// eachBatch: async ({ batch }) => {
		//   console.log(batch)
		// },
		eachMessage: async ({topic, partition, message}) => {
			const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
			console.log(`- ${prefix} ${message.key}#${message.value}`);
		},
	});
};

run().catch((e) => console.error(`[example/consumer] ${e.message}`, e));

const errorTypes = ["unhandledRejection", "uncaughtException"];
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

errorTypes.forEach((type) => {
	process.on(type, async (e) => {
		try {
			console.log(`process.on ${type}`);
			console.error(e);
			await consumer.disconnect();
			process.exit(0);
		} catch (_) {
			process.exit(1);
		}
	});
});

signalTraps.forEach((type) => {
	process.once(type, async () => {
		try {
			await consumer.disconnect();
		} finally {
			process.kill(process.pid, type);
		}
	});
});

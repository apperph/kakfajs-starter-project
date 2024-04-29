require('dotenv').config();
const { Kafka, logLevel } = require("kafkajs");

const clusterEndpoints = process.env.CLUSTER_ENDPOINTS || '';

const kafkaOptions = {
    logLevel: logLevel.INFO,
    clientId: "advanceph-app",
    brokers: clusterEndpoints.split(','),
    ssl: true,
    sasl: {
        mechanism: "SCRAM-SHA-512",
        username: process.env.CLUSTER_USERNAME,
        password: process.env.CLUSTER_PASSWORD
    },
};
// Other Kafka Options:
// authenticationTimeout: 10000,
// reauthenticationThreshold: 10000,
// sasl: {
//     mechanism: "aws",
//     authorizationIdentity: process.env.AWS_IAMUSER_ID, // UserId or RoleId
//     accessKeyId: process.env.AWS_ACCESS_ID,
//     secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
// }

const kafka = new Kafka(kafkaOptions);

module.exports = kafka;

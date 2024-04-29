const kafka = require('./kafka');
const admin = kafka.admin();


const run = async () => {
    // connect to kafka cluster
    await admin.connect();

    // Create topics
    await admin.createTopics({
        topics: [{
            topic: 'kafkajs.test-topic',
            numPartitions: 1,
            replicationFactor: 2
        }]
    }).then(async(response) => {
        console.log(`Topic Created: ${response}`);
    })
    
    // Create topics
    await admin.listTopics().then((response) => {
        console.log(response);
    })

    // Make sure you disconnect to the cluster
    await admin.disconnect()
};

run().catch((e) => console.error(`[topic/create] ${e.message}`, e));
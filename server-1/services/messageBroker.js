const amqp = require("amqplib");

const orderGenerationQueue = "orderGenerationQueue";
const orderCompletionQueue = "orderCompletionQueue";

async function initMQ() {
	try {
		const amqpServer = "amqp://rabbitmq:5672";
		const connection = await amqp.connect(amqpServer);
		const channel = await connection.createChannel();
		await channel.assertQueue(orderGenerationQueue, {
			durable: false,
		});
		await channel.assertQueue(orderCompletionQueue, {
			durable: false,
		});
        return channel;
	} catch (err) {
		console.log(`Error on init RabbitMQ: ${err}`);
	}

}

module.exports = initMQ;

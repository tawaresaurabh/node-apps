const http = require("http");
const amqp = require("amqplib");
let channel;
const orderGenerationQueue = "orderGenerationQueue";
const orderCompletionQueue = "orderCompletionQueue";
const prepareStage = [
	{ stage: "In progress", time: 1000, progress: 10 },
	{ stage: "In progress", time: 2000, progress: 30 },
	{ stage: "In progress", time: 3000, progress: 70 },
	{ stage: "In progress", time: 4000, progress: 90 },
	{ stage: "Ready", time: 5000, progress: 100 },
];

initMQ(amqp);

// Set server port
const PORT = 5002;

// Dummy response
const requestListener = function (req, res) {
	res.writeHead(200);
	res.end(JSON.stringify({ response: "Hello from server 2" }));
};

// Creates server
const server = http.createServer(requestListener);

// Server error listener
server.on("error", (err) => {
	console.error(err);
	server.close();
});

// Close server
server.on("close", () => console.log("Server closed."));

// Server starts listening
server.listen(PORT, () => {
	console.log(`Server 2: Listening on ports: ${PORT}`);
});

async function initMQ(amqp) {
	try {
		const amqpServer = "amqp://rabbitmq:5672";
		const connection = await amqp.connect(amqpServer);
		channel = await connection.createChannel();

		await channel.assertQueue(orderGenerationQueue, {
			durable: false,
		});
		await channel.assertQueue(orderCompletionQueue, {
			durable: false,
		});

		// Consume generated order from server 1
		channel.consume(
			orderGenerationQueue,
			async (msg) => {
				const msgDecoded = JSON.parse(msg.content.toString());
				console.log("Server 2 Received: ", msgDecoded);

				// Acknowledge recieved msg
				channel.ack(msg);

				prepare(msgDecoded)
			},
			{
				// manual acknowledgment mode,
				// see https://www.rabbitmq.com/confirms.html for details
				noAck: false,
			}
		);
	} catch (err) {
		console.log(`Error on init RabbitMQ: ${err}`);
	}
}

function prepare(data) {
	for (const stage of prepareStage) {
		setTimeout(() => {
			channel.sendToQueue(orderCompletionQueue, Buffer.from(JSON.stringify({...data, stage})));
		}, stage.time);
	}
}

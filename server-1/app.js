const express = require("express");
const cors = require("cors");
const http = require("http");
const rabbitMq = require("./services/messageBroker.js");

const app = express();

// Init message broker
const channel = rabbitMq();
//  Get db
const db = require("./models/db");
// Connect to db
db.connectDB("mongodb://mongodb:27017/sandwich");

const PORT = 5001;
const orderGenerationQueue = "orderGenerationQueue";
const orderCompletionQueue = "orderCompletionQueue";
const readyStateSocket = "orderReadyState";
const orderRouter = require("./routes/order");
const userRouter = require("./routes/user");
const sandwichRouter = require("./routes/sandwich");

app.use(cors());
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: false })); //Parse URL-encoded bodies

// Dummy response
const requestListener = function (req, res) {
	res.json({ response: "Hello from server 1" });
};

app.use("/test", (req, res) => {

	const data = req.query.data || "";
	channel.then((response) => {
		response.sendToQueue(
			orderGenerationQueue,
			Buffer.from(JSON.stringify({ data }))
		);
	});
	console.log("Server 1 sent", {data}, " to server 2");
	res.end();
});
app.use("/order", orderRouter);
app.use("/user", userRouter);
app.use("/sandwich", sandwichRouter);
app.use("/", requestListener);

const server = http.createServer(app);

const io = require("socket.io")(server, {
	cors: {
		origin: "http://sandwich-app:3000",
		methods: ["GET", "POST"],
	},
});

// Close server
server.on("close", () => console.log("Server 1 closed."));

// Close server
server.on("error", (err) => {
	console.log(`Server 1 Error: ${err}`);
	server.close();
});

// Server starts listening
server.listen(PORT, () => console.log(`Server 1: Listening on ports: ${PORT}`));

// io.on("connection", (socket) => {
// 	console.log("Client connected");
// 	socket.on("disconnect", () => {
// 		console.log("Client disconnected");
// 	});

// //Consume order completion state from server 2
channel.then((response) => {
	response.consume(
		orderCompletionQueue,
		async (msg) => {
			const msgDecoded = JSON.parse(msg.content.toString());
			console.log("Server 1 Received: ", msgDecoded);

			// // Update Client
			// socket.emit(readyStateSocket, msgDecoded);

			// // 		// handle the event sent with socket.emit()
			// socket.on(readyStateSocket, (data) => {
			// 	console.log("Data from client: ", data);
			// 	socket.emit(readyStateSocket, "Got your message");
			// });

			// Acknowledge recieved msg
			response.ack(msg);
		},
		{
			// manual acknowledgment mode,
			// see https://www.rabbitmq.com/confirms.html for details
			noAck: false,
		}
	);
});
// });

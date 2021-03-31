const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var amqp = require('amqplib/callback_api');
const { connectDB } = require('./db');

const Order = require('./burger');
const config = {
    name: 'node-app-2',
    port: 8081,
    host: '0.0.0.0',
};

const app = express();


app.use(cors());


let channel = null;

const orderGenerationQueue = 'orderGenerationQueue';
const orderCompletionQueue = 'orderCompletionQueue';


app.get('/', (req, res) => {
    //res.status(200).send('hello world from server 2!!');
});



async function init() {
    connectDB();
    const conn = await require('amqplib').connect('amqp://localhost:5672');
    const ch = await conn.createChannel();
    channel = ch;

    channel.assertQueue(orderGenerationQueue, {
        durable: false
    });
    channel.assertQueue(orderCompletionQueue, {
        durable: false
    });



    channel.consume(orderGenerationQueue, msg => {
        console.log('Received :' + msg.content.toString());
        const order = JSON.parse(msg.content.toString());
        console.log(order.steps)




        function process(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function startCookingSteps() {
            const orderObj = await Order.findById(order._id).exec();

            for (let i = 0; i < order.steps.length; i++) {
                await process(5000);
                console.log(order.steps[i]);
                orderObj.state = order.steps[i];
                orderObj.progress = orderObj.progress + (100 / order.steps.length)
                await orderObj.save();

                if ((i + 1) === order.steps.length) {
                    channel.sendToQueue(orderCompletionQueue, Buffer.from(JSON.stringify(order)));
                }
            }
        }

        startCookingSteps();

    },
        {
            noAck: true
        }
    );
}


init()
    .then(() => app.listen(config.port, config.host, () => console.log(`${config.name} running on ${config.host}:${config.port}`)))
    .catch(err => {
        console.error(err);
        throw new Error('Internal Server Error');
    })


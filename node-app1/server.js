const express = require('express');
const cors = require('cors');
var amqp = require('amqplib/callback_api');
const { connectDB } = require('./db');
var bodyParser = require('body-parser')

const path = require('path');



const Order = require('./burger');
const config = {
    name: 'node-app-1',
    port: 8080,
    host: '0.0.0.0',
};

const app = express();


app.use(bodyParser.json());
app.use(cors());

let channel = null;
//app.use(express.bodyParser())
const orderGenerationQueue = 'orderGenerationQueue';
const orderCompletionQueue = 'orderCompletionQueue';

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
    channel.consume('orderCompletionQueue',async (msg) => {
        console.log('Received :' + msg.content.toString())
        const order = JSON.parse(msg.content.toString());
        const orderObj = await Order.findById(order._id).exec(); 
        orderObj.state = 'COMPLETED';
        orderObj.progress = 100;
        await orderObj.save();

    } );
}


app.get('/', (req, res) => { 
    res.status(200).send('Order Sent for processing');
});



app.get('/activeOrders', async(req, res) => {      
    res.status(200).send(await Order.find({state:{$ne: 'COMPLETED'}}));
});


app.get('/orders', async(req, res) => {      
    res.status(200).send(await Order.find({}));
});



app.post('/order',async (req, res) => {
    console.log(req.body.id);

try {        
        const order = { id : req.body.id,
            name: req.body.name,
            price:req.body.price,
            time:req.body.time,
            state:'RECEIVED',
            progress : 0,
            steps : req.body.steps
        }
        const orderData = new Order(order);
        const savedOrder = await orderData.save();        
        console.log('Created Burger' , savedOrder);
        channel.sendToQueue(orderGenerationQueue, Buffer.from(JSON.stringify(savedOrder)));
        
        res.send(savedOrder);
      } catch (error) {
          console.log(error)
      }  

});

init()
    .then(()=> app.listen(config.port, config.host, () => console.log(`${config.name} running on ${config.host}:${config.port}`)))
    .catch(err=>{
        console.error(err);
        throw new Error('Internal Server Error');
    })




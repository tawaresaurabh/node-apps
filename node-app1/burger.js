const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const orderSchema = new Schema({

    name: {
        type: String,
        minlength: 2,
        required: true
    },

    description: {
        type: String,
    },

    price: {
        type: Number,
        required: true,
    },

    time: {
        type: Number,
        required: true,
    },

    state: {
        type: String,
        required: true,
    },

    progress: {
        type: Number
    },

    steps: [String]





});

orderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);


module.exports = Order;

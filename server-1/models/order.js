const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
	_id: {
		type: Number,
		unique: true,
	},
	sandwichId: {
		type: String,
		unique: true,
	},
	status: {
		type: String,
		enum: ["ordered", "received", "inQueue", "ready", "failed"],
	},
});

// Omit the version key when serialized to JSON
orderSchema.set("toJSON", { virtuals: false, versionKey: false });

const Order = new mongoose.model("Order", orderSchema);

module.exports = Order;

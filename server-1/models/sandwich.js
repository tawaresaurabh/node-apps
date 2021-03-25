const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const toppingSchema = new Schema({
	_id: {
		type: Number,
		unique: true,
	},
	name: {
		type: String,
		required: true,
	},
});

const Topping = new mongoose.model("Topping", toppingSchema);

const sandwichSchema = new Schema({
	_id: {
		type: Number,
		unique: true,
	},
	name: {
		type: String,
		required: true,
	},
	toppings: {
		type: [toppingSchema],
	},
	breadType: {
		type: String,
		required: true,
	},
});

// Omit the version key when serialized to JSON
sandwichSchema.set("toJSON", { virtuals: false, versionKey: false });

const Sandwich = new mongoose.model("Sandwich", sandwichSchema);

module.exports = Sandwich;

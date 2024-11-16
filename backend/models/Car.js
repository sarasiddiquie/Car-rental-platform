const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ensure 'user' is required
});

const Car = mongoose.model('Car', carSchema);
module.exports = Car;

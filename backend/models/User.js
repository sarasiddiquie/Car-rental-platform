const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],  // Reference to the Car model
});

module.exports = mongoose.model('User', UserSchema);

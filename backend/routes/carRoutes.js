const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const Grid = require('gridfs-stream');
const Car = require('../models/Car');
const router = express.Router();
const { dbURI } = require('../config/db');

// Initialize MongoDB connection
const conn = mongoose.createConnection(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo); // Initialize GridFS stream
    gfs.collection('uploads'); // Set the collection (bucket) to 'uploads'
});

// Multer setup for handling file uploads (in-memory storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporary storage for the file
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename based on timestamp
    },
});

const upload = multer({ storage }); // Multer setup to handle file uploads

// Create a new car and upload images (using GridFS)
router.post('/api/cars', async (req, res) => {
    try {
        // Assuming the user is authenticated and their ID is in the JWT token
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const userId = decoded.id;  // The logged-in user's ID

        // Create a new car with the user ID included
        const carData = {
            name: req.body.name,
            brand: req.body.brand,
            price: req.body.price,
            description: req.body.description,
            user: userId,  // Ensure this field is set
        };

        const newCar = new Car(carData);
        await newCar.save();
        res.status(201).json({ message: 'Car created successfully', car: newCar });
    } catch (error) {
        console.error('Error creating car:', error);
        res.status(400).json({ message: 'Error creating car', error });
    }
});


// Route to retrieve an image from MongoDB (GridFS)
router.get('/image/:filename', async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename }); // Find file in GridFS
        if (!file || file.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Create a readable stream from GridFS and pipe it to the response
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);  // Pipe the file stream to the response

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a car and its images from GridFS
router.delete('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Loop through all images associated with the car
        for (const filename of car.images) {
            const file = await gfs.files.findOne({ filename });
            if (file) {
                // Delete each file from GridFS
                await gfs.files.deleteOne({ _id: file._id });
            }
        }

        // Delete the car document from the database
        await Car.findByIdAndDelete(req.params.id);

        res.json({ message: 'Car and its images deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


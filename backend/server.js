const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const Grid = require('gridfs-stream');
const carRoutes = require('./routes/carRoutes');
const userRoutes = require('./routes/userRoutes');
const Car = require('./models/Car');

// Initialize Express app
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

// Middleware for CORS and JSON parsing
app.use(cors());
app.use(express.json());

// MongoDB connection setup for GridFS
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if MongoDB fails to connect
});

// Set up GridFS with Multer for file storage
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);  // GridFS stream connection
    gfs.collection('uploads'); // Set 'uploads' as the default bucket name
});

// Configure multer for handling file uploads temporarily (diskStorage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporary directory to store files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Use timestamp to ensure unique filenames
    }
});

const upload = multer({ storage });

// Serve static files (images) from the 'uploads' collection via GridFS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);

// Route to get all cars
app.get('/api/cars', async (req, res) => {
    try {
        const cars = await Car.find();  // Get all cars from the database
        res.status(200).json(cars);  // Send response with cars data
    } catch (error) {
        console.error('Error retrieving cars:', error);
        res.status(500).json({ message: 'Error retrieving cars' });
    }
});

app.post('/api/cars', upload.array('images', 10), async (req, res) => {
    try {
        // Extract the car details from the request body
        const { name, brand, price, description } = req.body;

        // Extract uploaded image files
        const imageFileIds = [];

        // Loop over the uploaded files and store them in GridFS
        for (const file of req.files) {
            const writeStream = gfs.createWriteStream({
                filename: file.originalname,
                content_type: file.mimetype,
            });

            // When the file is uploaded, store the file's ID
            writeStream.on('close', (uploadedFile) => {
                imageFileIds.push(uploadedFile._id);
            });

            // Upload the file buffer to GridFS
            writeStream.write(file.buffer);
            writeStream.end();
        }

        // Wait for the images to finish uploading (you can optimize this by using Promises)
        await new Promise(resolve => setTimeout(resolve, 1000));  // Just wait for a bit to ensure files upload

        // Create a new car object with the image file IDs
        const newCar = new Car({
            name,
            brand,
            price,
            description,
            images: imageFileIds,  // Save the file IDs of the images in the 'images' field
        });

        // Save the new car to the database
        await newCar.save();

        // Send the created car in the response
        res.status(201).json(newCar);

    } catch (error) {
        console.error('Error creating car:', error);
        res.status(500).json({ message: 'Error creating car' });
    }
});

// Route to fetch an image from GridFS
app.get('/uploads/:filename', async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });  // Find file in GridFS

        if (!file || file.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Create a readable stream for the file and pipe it to the response
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (error) {
        console.error('Error retrieving image:', error);
        res.status(500).json({ message: 'Error retrieving image' });
    }
});

// Global error handling middleware (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);  // Log error stack trace for debugging
    res.status(500).json({ message: 'Something went wrong!' });  // Send generic error message to client
});

// Start server on specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

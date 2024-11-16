const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

module.exports = (db) => {
  // Attach Grid to mongoose.mongo
  Grid.mongo = mongoose.mongo;

  // Initialize GridFS with the database connection
  const gfs = Grid(db, mongoose.mongo);
  gfs.collection('uploads'); // Set the collection (bucket) to 'uploads'

  // Return gfs to be used in other files
  return gfs;
};

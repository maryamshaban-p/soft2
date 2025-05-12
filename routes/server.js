const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = require('./app');
const bodyParser = require('body-parser');

// Load environment variables from .env
dotenv.config();

// Initialize express app
//const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
//const mongoose = require('mongoose');
const dbURI = process.env.CONNECT_DB; // Your MongoDB URI

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000, // Increase timeout to 30 seconds (default is 10000ms)
  socketTimeoutMS: 45000,  // Adjust socket timeout (optional)
}).then(() => {
  console.log("MongoDB connected successfully");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

// Connect to MongoDB with increased timeout
/* mongoose.connect(process.env.CONNECT_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 serverSelectionTimeoutMS: 30000, // 30 seconds to try connecting
  connectTimeoutMS: 30000, // Set a higher timeout for MongoDB
})
.then(() => console.log("MongoDB connected"))
.catch((error) => console.error("MongoDB connection error:", error));
 */
// Routes
const authRoutes = require('./auth');
app.use('/api/auth', authRoutes);

// Example of adding more routes
// app.use('/api/products', productRoutes);

// Set the port and start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
   console.log(`Server is running at http://localhost:${PORT}`);
});

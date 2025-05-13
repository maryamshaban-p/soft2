const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = require('./app');
const bodyParser = require('body-parser');


dotenv.config();


//const app = express();


app.use(cors());
app.use(bodyParser.json());
//const mongoose = require('mongoose');
const dbURI = process.env.CONNECT_DB; 

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000, 
  socketTimeoutMS: 45000,  
}).then(() => {
  console.log("MongoDB connected successfully");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});


const authRoutes = require('./auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
   console.log(`Server is running at http://localhost:${PORT}`);
});

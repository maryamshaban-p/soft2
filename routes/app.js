// app.js code 
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const authRoutes = require("./auth");
const { jwtMiddleware, authorize } = require('./middlewares/authMiddleware');
const helmet = require("helmet");

dotenv.config();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());


app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https://images.unsplash.com; " +
    "style-src 'self' 'unsafe-inline';"
  );
  next();
});


app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});


app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));


app.use("/api/auth", authRoutes);
app.use("/api/cart", require("./cartRoute"));
app.use("/api/products", require("./product"));


app.get('/api/protected', jwtMiddleware, (req, res) => {
  res.json({ msg: 'Access granted' });
});


app.get('/api/admin', jwtMiddleware, authorize(['admin']), (req, res) => {
  res.json({ msg: 'Admin access granted' });
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

module.exports = app;

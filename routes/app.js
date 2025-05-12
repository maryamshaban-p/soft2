// app.js code 
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const authRoutes = require("./auth");
const { jwtMiddleware, authorize } = require('./middlewares/authMiddleware');
const helmet = require("helmet");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

// إضافة CSP لتجنب أخطاء المتصفح مع السكربتات والصور
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https://images.unsplash.com; " +
    "style-src 'self' 'unsafe-inline';"
  );
  next();
});

// إضافة الهيدر X-XSS-Protection يدويًا لأن helmet لم يعد يدعمه
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cart", require("./cartRoute"));
app.use("/api/products", require("./product"));

// Protected Routes
app.get('/api/protected', jwtMiddleware, (req, res) => {
  res.json({ msg: 'Access granted' });
});

// Admin route with role-based authorization
app.get('/api/admin', jwtMiddleware, authorize(['admin']), (req, res) => {
  res.json({ msg: 'Admin access granted' });
});

// Home route (login page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

module.exports = app;
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('../auth');
const User = require('../models/users');

let app;
let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  process.env.ADMIN_EMAIL = 'admin@example.com';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
});

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Integration Tests', () => {
  const validUser = {
    name: 'Test User',
    email: 'user@example.com',
    phone: '0123456789',
    password: 'StrongP@ss1',
    gender: 'female',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('should not allow duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('User already exists');
  });

  it('should reject weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validUser,
      password: '123',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('Password is too weak');
  });

  it('should reject malicious email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validUser,
      email: '<script>alert(1)</script>',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/Invalid or malicious email/);
  });

  it('should login registered user successfully', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/login').send({
      email: validUser.email,
      password: validUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe('user');
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/login').send({
      email: validUser.email,
      password: 'WrongPassword',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('Invalid credentials');
  });

  it('should reject login for non-existing user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'noone@example.com',
      password: 'AnyP@ss1',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('Invalid credentials');
  });

  it('should login as admin if email matches ADMIN_EMAIL', async () => {
    const hashed = await bcrypt.hash('AdminP@ss1', 10);
    await new User({
      name: 'Admin',
      email: 'admin@example.com',
      phone: '0100000000',
      password: hashed,
      gender: 'male',
    }).save();

    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'AdminP@ss1',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe('admin');
    expect(res.body.token).toBeDefined();
  });
it('should return 500 if there is a server error during registration', async () => {
  const spy = jest.spyOn(User.prototype, 'save').mockImplementation(() => {
    throw new Error('Simulated registration failure');
  });

  const res = await request(app).post('/api/auth/register').send({
    name: 'Fail User',
    email: 'fail@example.com',
    phone: '0111111111',
    password: 'StrongP@ss1',
    gender: 'male',
  });

  expect(res.statusCode).toBe(500);
  expect(res.body.msg).toBe('Database operation timeout or connection issue');
  expect(res.body.error).toBe('Simulated registration failure');

  spy.mockRestore();
});

  it('should return 500 on server error', async () => {
    const spy = jest.spyOn(User, 'findOne').mockImplementation(() => {
      throw new Error('Simulated failure');
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'any@example.com',
      password: 'StrongP@ss1',
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.msg).toBe('Server error');
    spy.mockRestore();
  });
});

// app.test.js
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
jest.setTimeout(15000); // Set global timeout to 15 seconds

describe('App.js Integration Tests', () => {
  let adminToken;
  let userToken;

  beforeAll(() => {
    // Generate mock JWT tokens
    adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ id: 'user123', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  // Test static file serving
  it('should serve static files from /public directory', async () => {
    const res = await request(app).get('/uploads/sample.jpg'); // Assuming a sample image exists in public/uploads
    expect(res.statusCode).toBe(200);
  });

  // Test Content Security Policy Header
const jwt = require('jsonwebtoken');

// Replace with a test user ID and role
const token1 = jwt.sign({ id: 'testid', role: 'user' }, process.env.JWT_SECRET || 'secret', {
  expiresIn: '1h',
});

it('should set CSP header for /api/protected', async () => {
  const res = await request(app)
    .get('/api/protected')
    .set('Authorization', `Bearer ${token1}`);
  
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-security-policy']).toBeDefined();
});

  // Test X-XSS-Protection header


const token = jwt.sign(
  { id: 'testuser', role: 'user' },
  process.env.JWT_SECRET || 'secret', // Make sure this matches your app's JWT secret
  { expiresIn: '1h' }
);

it('should set X-XSS-Protection header for /api/protected', async () => {
  const res = await request(app)
    .get('/api/protected')
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['x-xss-protection']).toBe('1; mode=block');
});


  // Test /api/protected without token
  it('should return 401 for accessing /api/protected without token', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('No token, authorization denied');
  });

  // Test /api/protected with valid token
  it('should return 200 for accessing /api/protected with token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Access granted');
  });

  // Test /api/admin without admin role
  it('should return 403 for accessing /api/admin without admin role', async () => {
    const res = await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe('Forbidden');
  });
  

  // Test /api/admin with admin role
  it('should return 200 for accessing /api/admin with admin role', async () => {
    const res = await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Admin access granted');
  });

  // Test /api/auth/register route (assuming registration logic exists)
/* it('should return 201 for successful registration', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: `test${Date.now()}@example.com`, // unique email
      password: 'Test5311234@',
      gender: 'female',
      // role: 'user',             // Include if your route requires it
      // confirmPassword: 'test1234' // Include if required
    });

  console.log(res.body); // 🐞 Debug: log the error message
  expect(res.statusCode).toBe(201);
}, 15000);
 */


  // Test /api/auth/login route (assuming login logic exists)
  /*  it('should return 200 for successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'Test5311234@',
       
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Login successful');
    expect(res.body.token).toBeDefined(); // Token should be returned
  }); */

  // Test Home route (login page)
 it('should return HTML content for home route', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.text).toContain('<!DOCTYPE html>');
  expect(res.text).toContain('<html'); // flexible match
});

});

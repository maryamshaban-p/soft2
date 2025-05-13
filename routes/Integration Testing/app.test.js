// app.test.js
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
jest.setTimeout(15000); 
describe('App.js Integration Tests', () => {
  let adminToken;
  let userToken;

  beforeAll(() => {
    
    adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ id: 'user123', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

 
  it('should serve static files from /public directory', async () => {
    const res = await request(app).get('/uploads/sample.jpg');
    expect(res.statusCode).toBe(200);
  });

 
const jwt = require('jsonwebtoken');


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


const token = jwt.sign(
  { id: 'testuser', role: 'user' },
  process.env.JWT_SECRET || 'secret', 
  { expiresIn: '1h' }
);

it('should set X-XSS-Protection header for /api/protected', async () => {
  const res = await request(app)
    .get('/api/protected')
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['x-xss-protection']).toBe('1; mode=block');
});

  it('should return 401 for accessing /api/protected without token', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('No token, authorization denied');
  });

  
  it('should return 200 for accessing /api/protected with token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Access granted');
  });

  
  it('should return 403 for accessing /api/admin without admin role', async () => {
    const res = await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe('Forbidden');
  });
  

 
  it('should return 200 for accessing /api/admin with admin role', async () => {
    const res = await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Admin access granted');
  });


 it('should return HTML content for home route', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.text).toContain('<!DOCTYPE html>');
  expect(res.text).toContain('<html'); // flexible match
});

});

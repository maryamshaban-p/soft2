const jwt = require('jsonwebtoken');
const { jwtMiddleware, authorize } = require('../middlewares/authMiddleware');


jest.mock('jsonwebtoken');
process.env.JWT_SECRET = 'your-secret-key';

describe('JWT Middleware and Authorization Tests', () => {

  describe('JWT Middleware', () => {

    it('should call next() if token is valid', () => {
      const req = {
        headers: { authorization: 'Bearer valid_token' }
      };

      jwt.verify.mockReturnValue({ id: '123', role: 'user' });

      const next = jest.fn();
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jwtMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should send 401 if no token is provided', () => {
      const req = { headers: { authorization: undefined } };
      const next = jest.fn();
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jwtMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'No token, authorization denied' });
    });

    it('should send 401 if token is invalid', () => {
      const req = {
        headers: { authorization: 'Bearer invalid_token' }
      };

      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      const next = jest.fn();
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jwtMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Token is not valid' });
    });

    it('should send 401 if decoded token is missing required fields', () => {
      const req = {
        headers: { authorization: 'Bearer valid_token' }
      };

      jwt.verify.mockReturnValue({});  // Missing required fields like id

      const next = jest.fn();
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jwtMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Token is not valid' });
    });

  });

  describe('Authorize Middleware', () => {
    it('should return 403 if user does not have required role', () => {
      const req = {
        user: { role: 'user' }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      authorize(['admin'])(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Forbidden' });
    });

    it('should call next() if user has required role', () => {
      const req = {
        user: { role: 'admin' }
      };
      const res = {};
      const next = jest.fn();

      authorize(['admin'])(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

});

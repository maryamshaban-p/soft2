const express = require('express');
const { addToCart, getCart, removeFromCart } = require('../services/cartService');
const cartRouter = require('../cartRoute');
const httpMocks = require('node-mocks-http');
const supertest = require('supertest'); 

jest.mock('../services/cartService');

describe('Cart Route Handlers - Unit Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json()); 
    app.use('/cart', cartRouter); 
  });

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  describe('POST /cart/add', () => {
    it('should add product to cart successfully', async () => {
      const mockCart = { userId: 'user123', products: [{ id: 'product1', quantity: 1 }] };
      addToCart.mockResolvedValue(mockCart);

      const response = await supertest(app)  
        .post('/cart/add')
        .send({ userId: 'user123', productId: 'product1', quantity: 1 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product added to cart successfully');
      expect(response.body.cart).toEqual(mockCart);
      expect(addToCart).toHaveBeenCalledWith({ userId: 'user123', productId: 'product1', quantity: 1 });
    });

    it('should return an error when addToCart fails', async () => {
      addToCart.mockRejectedValue(new Error('Failed to add product'));

      const response = await supertest(app)
        .post('/cart/add')
        .send({ userId: 'user123', productId: 'product1', quantity: 1 });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to add product');
    });
  });

  describe('GET /cart/:userId', () => {
    it('should return cart data for a given userId', async () => {
      const mockCart = { userId: 'user123', products: [{ id: 'product1', quantity: 1 }] };
      getCart.mockResolvedValue(mockCart);

      const response = await supertest(app)
        .get('/cart/user123');

      expect(response.status).toBe(200);
      expect(response.body.cart).toEqual(mockCart);
      expect(getCart).toHaveBeenCalledWith('user123');
    });

    it('should return an error when getCart fails', async () => {
      getCart.mockRejectedValue(new Error('Failed to retrieve cart'));

      const response = await supertest(app)
        .get('/cart/user123');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to retrieve cart');
    });
  });

  describe('DELETE /cart/remove', () => {
    it('should remove product from cart successfully', async () => {
      const mockCart = { userId: 'user123', products: [] };
      removeFromCart.mockResolvedValue(mockCart);

      const response = await supertest(app)
        .delete('/cart/remove')
        .send({ userId: 'user123', productId: 'product1' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product removed from cart');
      expect(response.body.cart).toEqual(mockCart);
      expect(removeFromCart).toHaveBeenCalledWith('user123', 'product1');
    });

    it('should return an error when removeFromCart fails', async () => {
      removeFromCart.mockRejectedValue(new Error('Failed to remove product'));

      const response = await supertest(app)
        .delete('/cart/remove')
        .send({ userId: 'user123', productId: 'product1' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to remove product');
    });
  });
});

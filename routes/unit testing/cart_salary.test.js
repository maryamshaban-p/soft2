const { calculateTotalPrice } = require('../services/cart_total_salary');

describe('calculateTotalPrice', () => {
  it('should return 0 if the cart is empty', () => {
    const cartItems = [];
    const total = calculateTotalPrice(cartItems);
    expect(total).toBe(0);
  });

  it('should calculate the total price correctly for a single item', () => {
    const cartItems = [
      { productPrice: 10, quantity: 2 },
    ];
    const total = calculateTotalPrice(cartItems);
    expect(total).toBe(20);
  });

  it('should calculate the total price correctly for multiple items', () => {
    const cartItems = [
      { productPrice: 10, quantity: 2 },
      { productPrice: 20, quantity: 1 },
      { productPrice: 5, quantity: 4 },
    ];
    const total = calculateTotalPrice(cartItems);
    expect(total).toBe(60);
  });

  it('should handle items with zero quantity', () => {
    const cartItems = [
      { productPrice: 10, quantity: 0 },
      { productPrice: 20, quantity: 1 },
    ];
    const total = calculateTotalPrice(cartItems);
    expect(total).toBe(20);
  });
});

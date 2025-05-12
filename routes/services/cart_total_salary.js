function calculateTotalPrice(cartItems) {
  return cartItems.reduce((total, item) => {
    return total + (item.productPrice * item.quantity);
  }, 0);
}

module.exports = {
  calculateTotalPrice,
};

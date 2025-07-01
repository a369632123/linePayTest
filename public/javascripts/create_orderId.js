function create_orderId() {
  // Generate a unique order ID using the current timestamp and a random number
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `order_${timestamp}_${randomNum}`;
}

module.exports = {
  create_orderId,
};
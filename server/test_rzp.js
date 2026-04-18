const Razorpay = require('razorpay');
const r = new Razorpay({ key_id: 'rzp_test_placeholder_key', key_secret: 'foo' });
r.orders.create({ amount: 999, currency: 'USD', receipt: 'rcpt_123456789012345678901234567890123456' })
  .then(console.log).catch(err => console.error(err.error));

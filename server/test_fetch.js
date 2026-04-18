const axios = require('axios');
axios.post('http://localhost:5001/api/subscriptions/razorpay/create-order', { planId: 'monthly' })
  .then(res => console.log(res.data))
  .catch(err => {
    console.error(err.response ? err.response.data : err.message);
  });

const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

require('dotenv').config()
const {
  LINEPAY_CHANNEL_ID,
  LINEPAY_CHANNEL_SECRET_KEY,
  LINEPAY_SITE,
  LINEPAY_RETURN_HOST,
  LINEPAY_RETURN_CONFIRM_URL,
  LINEPAY_RETURN_CANCEL_URL,
} = process.env;
const orders = {}

const sampleData = require('../sample/sampleData.js');
const crypto_functions = require('../public/javascripts/crypto_functions.js');
const linepayAPI_request = require('../public/javascripts/linepayAPI_request.js');
const create_orderId = require('../public/javascripts/create_orderId.js');

/* 前端頁面 */
router
  .get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  })
  .get('/checkout/:id', function(req, res) {
    const { id } = req.params;
    const order = sampleData[id];
    order.orderId = create_orderId.create_orderId();
    orders[order.orderId] = order;

    res.render('checkout', { order });
  })

/* LINE Pay API */
router
  .post('/createOrder/:orderId', async function(req, res) {
    const { orderId } = req.params;
    const order = orders[orderId];

    console.log('Creating order:', order);

  try{
    const linePayBody = {
      ...order,
      redirectUrls: {
        confirmUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CONFIRM_URL}`,
        cancelUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CANCEL_URL}`,
      },
    }

    const linePayRes = await linepayAPI_request.requestOnlineAPI({
      method: "POST",
      apiPath: "/v3/payments/request",
      data: linePayBody,
    });
    
    console.log('LINE Pay Response:', linePayRes.data);

    if (linePayRes.data.returnCode === '0000') {
       res.redirect(linePayRes.data.info.paymentUrl.web);
    }
  } catch (error) {
      console.error('Error creating LINE Pay order:', error);
      console.log(error);
  }

    res.end();
  });
// 確認付款
router
  .get('/linePay/confirm', async function(req, res) {
    const { transactionId, orderId } = req.query;
    console.log('Confirming payment for transaction:', transactionId, 'Order ID:', orderId);
  
    try {
      const order = orders[orderId];
      const linePayBody = {
        amount: order.amount,
        currency: order.currency,
      };

      const linePayRes = await linepayAPI_request.requestOnlineAPI({
        method: 'POST',
        apiPath: `/v3/payments/${transactionId}/confirm`,
        data: linePayBody,
      });

      if (linePayRes.data.returnCode === '0000') {
        // Payment confirmed successfully
        console.log('Payment confirmed successfully:', linePayRes.data);
        res.redirect(`${LINEPAY_RETURN_HOST}/payment/success?orderId=${orderId}`);
      } else {
        // Payment confirmation failed
        console.error('Payment confirmation failed:', linePayRes.data);
        res.redirect(`${LINEPAY_RETURN_HOST}/payment/failure?orderId=${orderId}`);
      }

    } catch (error) {
      console.error('Error confirming LINE Pay payment:', error);
      res.status(500).send('Error confirming payment');
      return;
    }

    res.end();
  });
// 付款成功
router
  .get('/payment/success', async function(req, res) {
    const { orderId } = req.query;
    const order = orders[orderId];
    console.log('Payment successful for Order ID:', orderId);

    res.render('linePaySuccess', { order });
  })
// 付款失敗
  .get('/payment/failure', async function(req, res) {
    const { orderId } = req.query;
    const order = orders[orderId];
    console.log('Payment failed for Order ID:', orderId);

    res.render('linePayFail', { order });
  });

// 取消付款
router
  .get('/linePay/cancel', async function(req, res) {
    const { transactionId, orderId } = req.query;
    console.log('Cancelling payment for transaction:', transactionId, 'Order ID:', orderId);
  
    try {
      const linePayRes = await linepayAPI_request.requestOnlineAPI({
        method: 'POST',
        apiPath: `/v3/payments/${transactionId}/cancel`,
      });

      if (linePayRes.data.returnCode === '0000') {
        // Payment cancelled successfully
        console.log('Payment cancelled successfully:', linePayRes.data);
        res.redirect(`${LINEPAY_RETURN_HOST}/payment/cancel?orderId=${orderId}`);
      } else {
        // Payment cancellation failed
        console.error('Payment cancellation failed:', linePayRes.data);
        res.redirect(`${LINEPAY_RETURN_HOST}/payment/failure?orderId=${orderId}`);
      }

    } catch (error) {
      console.error('Error cancelling LINE Pay payment:', error);
      res.status(500).send('Error cancelling payment');
      return;
    }

    res.end();
  });
// 取得訂單資訊
router
  .get('/linePay/order/:orderId', async function(req, res) {
    const { orderId } = req.params;
    console.log('Fetching order information for Order ID:', orderId);
  
    try {
      const linePayRes = await linepayAPI_request.requestOnlineAPI({
        method: 'GET',
        apiPath: `/v3/payments/${orderId}`,
      });

      if (linePayRes.data.returnCode === '0000') {
        // Order information fetched successfully
        console.log('Order information:', linePayRes.data);
        res.json(linePayRes.data);
      } else {
        // Failed to fetch order information
        console.error('Failed to fetch order information:', linePayRes.data);
        res.status(400).json({ error: 'Failed to fetch order information' });
      }

    } catch (error) {
      console.error('Error fetching LINE Pay order information:', error);
      res.status(500).send('Error fetching order information');
      return;
    }

    res.end();
  });


module.exports = router;

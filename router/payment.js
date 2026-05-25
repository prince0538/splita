const router = require('express').Router();

const { initailizePayment, verifyPayment, getAllPaymentByUser, koraWebhook } = require('../controller/payment');
const { initailizePaystackPayment, verifyPaystackPayment, paystackWebhook } = require('../controller/paystack');
const { authentication } = require('../middlewares/auth');

router.post('/make-payment/:groupId', authentication, initailizePayment);
router.post('/payment/kora/webhook', koraWebhook);
router.post('/payment/paystack/webhook', paystackWebhook);
router.post('/make-payment-paystack/:groupId', authentication, initailizePaystackPayment);
router.get('/verify-payment', authentication, verifyPayment);
router.get('/verify-payment-paystack', authentication, verifyPaystackPayment);
router.get('/all-payments', authentication, getAllPaymentByUser);

module.exports = router;

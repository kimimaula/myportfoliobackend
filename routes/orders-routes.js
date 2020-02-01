const express = require("express");
const orderControllers = require('../controllers/order-controller')

const router = express.Router();

//route for new order
router.post('/neworders', orderControllers.newOrder);

//route for user orders
router.get('/:uid', orderControllers.getOrdersByUser);

module.exports = router;
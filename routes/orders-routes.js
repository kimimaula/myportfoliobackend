const express = require("express");
const formidableMiddleware = require('express-formidable');
const orderControllers = require('../controllers/order-controller');

const router = express.Router();

//route for new order
router.post('/neworders', formidableMiddleware(), orderControllers.newOrder);

//route for user orders
router.get('/:uid', formidableMiddleware(), orderControllers.getOrdersByUser);

module.exports = router;
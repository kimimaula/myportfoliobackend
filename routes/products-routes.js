const express = require("express");
const fileUpload = require('../middleware/file-upload')
const formidableMiddleware = require('express-formidable');
const productControllers = require('../controllers/products-controllers')

const router = express.Router();

//route for getting all products
router.get('/', formidableMiddleware(), productControllers.getProducts);

//route for clicking on an item
router.get('/:pid', formidableMiddleware(), productControllers.getProductByID);

//route for clicking on an a user which brings up all item users have
router.get('/user/:uid', formidableMiddleware(), productControllers.getProductsByUser);

//route for new product
router.post('/:uid', fileUpload.single('image'), productControllers.createProduct);

//route for updating product
router.patch('/:pid', formidableMiddleware(), productControllers.updateProductById);

//route for deleting product
router.delete('/:pid', formidableMiddleware(), productControllers.deleteProductById);

module.exports = router;
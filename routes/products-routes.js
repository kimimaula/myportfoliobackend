const express = require("express");
const productControllers = require('../controllers/products-controllers')

const router = express.Router();

//route for getting all products
router.get('/', productControllers.getProducts);

//route for clicking on an item
router.get('/:pid', productControllers.getProductByID);

//route for clicking on an a user which brings up all item users have
router.get('/user/:pid', productControllers.getProductsByUser);

//route for new product
router.post('/:uid', productControllers.createProduct);

//route for updating product
router.patch('/:pid', productControllers.updateProductById);

//route for deleting product
router.delete('/:pid', productControllers.deleteProductById);

module.exports = router;
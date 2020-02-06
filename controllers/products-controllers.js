const HttpError = require("../models/http-error");
const Product = require('../models/product')
const User = require('../models/user')
const mongoose = require('mongoose');
const validateToken = require('../validation/validatetoken')
const validateItemInput = require('../validation/product')

//<---------------------------get all products, no token validation required----------------------->

const getProducts = async (req, res, next) => {

    let product;
    //if the items is wrong and findbyId only returns the object
    try{
        product = await Product.find();
    } catch (err) {
        const error = new HttpError('Opps, something went wrong. The product you are looking for is no longer available', 500);
        return next(error);
    }
    //if the entered params id is wrong
    if (!product) {
        const error = new HttpError('Opps, something went wrong. The product you are looking for does not exist', 404);
        return next(error);
    } 
    //changes the product from mongoose format to JV
    res.json({products: product});
};

//<---------------------------get products by ID, no token validation required----------------------->

const getProductByID = async (req, res, next) => {
    const productId = req.params.pid;

    let product;
    //if the items is wrong and findbyId only returns the object
    try{
        product = await Product.findById(productId);
    } catch (err) {
        const error = new HttpError('Opps, something went wrong. The product you are looking for is no longer available', 500);
        return next(error);
    }
    //if the entered params id is wrong
    if (!product) {
        const error = new HttpError('Opps, something went wrong. The product you are looking for does not exist', 404);
        return next(error);
    } 
    //changes the product from mongoose format to JV
    res.json({ product: product.toObject({  getters: true }) });
};

//<---------------------------get products by user, no token validation required----------------------->

const getProductsByUser = async (req, res, next) => {
    const userId = req.params.uid;
    
    let userProducts;

    //finds objects with user:userid and returns an array
    try{ 
        userProducts = await User.findById(userId).populate('products');
    } catch(err) {
        const error = new HttpError('Opps, something went wrong. Please try again later', 500);
        return next(error);
    }
    res.json({products: userProducts.products.map(product => product.toObject({ getters: true }))});
};

//<---------------------------create products, token validation required----------------------->

const createProduct  = async (req, res, next) => {
    
    const { title, description, price } = req.body;
    const authHeaderValue = req.headers['authorization']

    const { stringError, isValid } = await validateItemInput(req.body)

    if (!req.file) {
        return res.status(422).json("Image not attached");
    }

    if (!authHeaderValue) {
        if (req.file) {
            fs.unlink(req.file.path, err => {
              console.log(err)
            });
          }
        return res.status(422).json("Token not available, please log in");
    }

    if (!isValid) {
        if (req.file) {
            fs.unlink(req.file.path, err => {
              console.log(err)
            });
          }
        return res.status(422).json(stringError);
    }

    const token = await authHeaderValue.replace('Bearer ', '')
    const { error, id } = await validateToken(token)
    
    if (error) {
        return next(new HttpError(error.message, 404))
    } 

    //take into consideration concurrency, save will do for now as only 1 user will be updating the document at a time

    Creator = await User.findOne({ _id: id })

    if (Creator.id !== id) {
        return res.status(422).json("You do not have permission to upload this document");
    }

    const createdProduct = new Product({    
        title,
        description,
        price,
        image :req.file.path,
        user: id
            })
    
     try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdProduct.save({ session: sess });
        Creator.products.push(createdProduct);
        await Creator.save({ session: sess });
        await sess.commitTransaction();
     } catch(err) {
        if (req.file) {
            fs.unlink(req.file.path, err => {
              console.log(err)
            });
          }
        return res.status(422).json("Something went wrong, please try again later");
     }
     res.status(201).json({ message: 'Product Created!' })
};

//<---------------------------update products, token validation required----------------------->

const updateProductById  = async (req, res, next) => {
    const productId = req.params.pid;

    const { title, description, price, image } = req.body;

    const authHeaderValue = req.headers['authorization']

    if ( !isValid || !authHeaderValue) {
        if (req.file) {
          fs.unlink(req.file.path, err => {
            console.log(err)
          });
        }
        return res.status(422).json(errors);
       }

    const token = await authHeaderValue.replace('Bearer ', '')

    try{
        const { id } = await validateToken(token)
    } catch (err) {
        return next(new HttpError('Opps, something went wrong. Token entered invalid', 500))
    }

    let product;
    //if the items is wrong and findbyId only returns the object
    try{
        product = await Product.findById(productId);
        console.log(product)
    } catch (err) {
        const error = new HttpError('Opps, something went wrong. Could not update the product that you specified', 500);
        return next(error);
    }

    product.title = title;
    product.description = description;
    product.price = price;
    product.image = image;

    Product.update(
        { _id: productId },
        {
          $set : {
            title : title,
            description : description,
            price: price,
            image: image
          }
        }, 
      function (err, result) {
        if (err) {
        return next(new HttpError(err.message, 404))
          }
        }
      )

    res.status(200).json({product: product.toObject({ getters : true })})
};

const deleteProductById  = async (req, res, next) => {

    const authHeaderValue = req.headers['authorization']

    if (!authHeaderValue) {
         return next(new HttpError('Session Token Not available, please log in and try again.', 500));
    }


    const token = await authHeaderValue.replace('Bearer ', '')

    try{
        const { id } = await validateToken(token)
    } catch (err) {
        return next(new HttpError('Opps, something went wrong. Token entered invalid', 500))
    }
    
    const productId = req.params.pid
    let product

    console.log(product)

     try {
         product = await Product.findById(productId).populate('user')
     } catch (err) {
         const error = new HttpError('Opps, something went wrong. Could not delete the product that you specified', 500);
         return next(error);
     }

     try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await product.remove({ session : sess });
        product.user.products.pull(product);
        await product.user.save({ session: sess });
        await sess.commitTransaction();
     } catch(err) {
         const error = new HttpError(err.message, 500);
         return next(error);
     }

    res.status(200).json({message: 'Item Deleted'})
};

exports.getProducts = getProducts
exports.getProductByID = getProductByID;
exports.getProductsByUser = getProductsByUser;
exports.createProduct = createProduct;
exports.updateProductById = updateProductById;
exports.deleteProductById = deleteProductById;


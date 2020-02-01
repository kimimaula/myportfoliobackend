const HttpError = require("../models/http-error");
const User = require('../models/user')
const mongoose = require('mongoose');
const validateToken = require('../validation/validatetoken')
const Order = require('../models/order')

const newOrder  = async (req, res, next) => {
    
     const { totalprice, orders } = req.body;
     const authHeaderValue = req.headers['authorization']

     if (!authHeaderValue) {
          return next(new HttpError('Session Token Not available, please log in and try again.', 500));
     }

     const token = await authHeaderValue.replace('Bearer: ', '');

     try {
         const { id } = await validateToken(token)    
     } catch (err) {
         const error = new HttpError(err.message, 500);
          return next(error);
     }

     Creator = await User.findOne({ _id: id })

     currentTime = Date();

     const newOrder = new Order({    
         orderdate : currentTime,
         totalprice,
         orders,
         user: id
            })
    
      try{
         const sess = await mongoose.startSession();
         sess.startTransaction();
         await newOrder.save({ session: sess });
         Creator.orders.push(newOrder);
         await Creator.save({ session: sess });
         await sess.commitTransaction();
      } catch(err) {
          const error = new HttpError(err.message, 404);
          return next(error);
      }
      res.status(201).json({ message : "Success!!" })
}

const getOrdersByUser = async (req, res, next) => {
    
    const authHeaderValue = req.headers['authorization'];

    if (!authHeaderValue) {
         return next(new HttpError('Session Token Not available, please log in and try again.', 500));
    }

    const token = await authHeaderValue.replace('Bearer: ', '');
    
    try {
        const { id } = await validateToken(token)    
    } catch (err) {
        const error = new HttpError(err.message, 500);
         return next(error);
    }
    
    let userOrders;

    //finds objects with user:userid and returns an array
    try{ 
        userOrders = await User.findById(id).populate('orders');
    } catch(err) {
        const error = new HttpError('Opps, something went wrong. Please try again later', 500);
        return next(error);
    }

    if (!userOrders || userOrders.products.length === 0 ) {
        return next(new HttpError('The user has not posted any items yet.', 404))
    } 
    res.json({Order: userOrders.orders.map(product => product.toObject({ getters: true }))})
};

exports.newOrder = newOrder;
exports.getOrdersByUser = getOrdersByUser;
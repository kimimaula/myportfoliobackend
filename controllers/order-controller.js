const HttpError = require('../models/http-error');
const User = require('../models/user')
const mongoose = require('mongoose');
const validateToken = require('../validation/validatetoken')
const Order = require('../models/order')
const CurrentDate = require('../utils/date')

const newOrder  = async (req, res, next) => {

    const { totalprice, orders } = req.fields;
    const authHeaderValue = req.headers['authorization']


     if (!authHeaderValue) {
        return res.status(500).json("Session token not available");
     }

     const token = await authHeaderValue.replace('Bearer ', '');

     try {
         const { id } = await validateToken(token)    
     } catch (err) {
        return res.status(500).json("Invalid Token");
     }

     Creator = await User.findOne({ _id: id })

     const { date } = CurrentDate();

     console.log(date)

     const newOrder = new Order({    
         orderdate : date,
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

    const token = await authHeaderValue.replace('Bearer ', '');
    
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
    res.json({Order: userOrders.orders.map(product => product.toObject({ getters: true }))})
};

exports.newOrder = newOrder;
exports.getOrdersByUser = getOrdersByUser;
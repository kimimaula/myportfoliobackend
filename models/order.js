const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    orderdate: { type: String, required: true },
    totalprice: { type: Number, required: true },
    orders: [{ 
        itemId : { type: mongoose.Types.ObjectId, required: true },
        itemname: { type: String, required: true },
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Orders', productSchema);
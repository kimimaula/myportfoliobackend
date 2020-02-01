const mongoose = require('mongoose');
uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;
//unique in email speed up query process
const userSchema = new Schema({
    username : { type: String, required: true },
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true, minlength: 6 },
    image: { type: String },
    products: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Product' }],
    cart: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Product' }],
    orders: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Orders' }]
});

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Image = new Schema({
    imageName : { type: String, required: true },
    imageData : { type: String, required: true }, 
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Image', productSchema);
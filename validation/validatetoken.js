const keys = require('../config/keys')
const jwt = require('jsonwebtoken');

module.exports = async function ValidateToken(token) {
    
    let decoded = await jwt.verify(token, keys.secretOrKey);

    user = decoded.user;
    email = decoded.email;
    id = decoded.id

    return { id: id, user : user, email : email}
}
const express = require("express");
const userControllers = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload')
const formidableMiddleware = require('express-formidable');

const router = express.Router();

//route for dashboard
router.get('/:uid', formidableMiddleware(), userControllers.getUser);

//route to edit dashboard
router.patch('/:uid',formidableMiddleware(), userControllers.updateUser);

//route for signing up
router.post('/signup', fileUpload.single('image') ,userControllers.signUp);

//route for logging in
router.post('/login', formidableMiddleware(), userControllers.login);

module.exports = router;
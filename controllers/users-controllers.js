
const fs = require('fs');
const isEmpty = require('is-empty');
const jwt = require('jsonwebtoken');
const User = require("../models/user")
const keys = require('../config/keys')

const saltRounds = 12;
const bcrypt = require("bcryptjs");
const validateLoginInput = require("../validation/login");
const validateToken = require('../validation/validatetoken');
const validateRegisterInput = require("../validation/register");

//<------------------------gets specific user, needs token as this will be the dashboard----------------------------------------->

 const getUser = async (req, res, next) => {

   const authHeaderValue = req.headers['authorization']

   if (!authHeaderValue) {
    return res.status(500).json({ success: false, message: 'Whoops, token unavailable. Try to log out and back in again' });
    }

  const token = await authHeaderValue.replace('Bearer ', '')
  const { error, id } = await validateToken(token)

     if (error) {
      return res.status(404).send({ success: false, message: 'Whoops, token unavailable. Try to log out and back in again' });
     } 

   let currentUser;

   try{
     currentUser = await User.find({ _id: id },'-password')
   } catch (e) {
    return res.status(500).json({ success: false, message: 'Whoops, cannot find the user you are looking for' });
   }
  
  
   if (isEmpty(currentUser)) {
    return res.status(404).json({ success: false, message: 'Whoops, cannot find the user you are looking for' });
   }

     res.status(201).json({ currentUser })
 };

//<------------------------updates specific user, needs token----------------------------------------->

 const updateUser = async (req, res, next) => {
  let { username, email } = req.fields;
  const authHeaderValue = req.headers['authorization']
  
  if (!authHeaderValue) {
    return res.status(500).json({ success: false, message: 'Whoops, token unavailable. Try to log out and back in again' });
   }

   let existingUserEmail
   let existingUsername
 
  try {
   existingUserEmail = await User.find({ email : email })
   existingUsername = await User.find({ username : username })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Whoops, something went wrong. Please try again later' })
  }

  console.log(existingUserEmail)
 
  if (!isEmpty(existingUserEmail)) {
    return res.status(404).json({ success: false, message: 'Whoops, email already taken' })
  }
 
   if (!isEmpty(existingUsername)) {
    return res.status(404).json(({ success: false, message: 'Whoops, username already taken' }))
  }

  const token = await authHeaderValue.replace('Bearer ', '')
  const { error, id } = await validateToken(token)  

    if (error) {
      return res.status(404).json(error)
    } 

    if (!username) {
      const currentUser = await User.findOne({ _id: id })
      username = currentUser.username;
    };

    if (!email) {
      const currentUser = await User.findOne({ _id: id })
      email = currentUser.email;
    };

    User.update(
      { _id: id },
      {
        $set : {
          username : username,
          email : email
        }
      }, 
    function (err, result) {
      if (err) {
        return res.status(422).json({ success: false, message: 'Whoops, something went wrong. Please try again later' })
        }
      }
    )

    res.status(201).json({ success: true, message: 'Update Completed' })
};

//<------------------------creates new user, no token needed ----------------------------------------->

const signUp = async (req, res, next) => {

   const { errors, isValid } = await validateRegisterInput(req.body);

  //Check validation and unroll upload if error
   if (!isValid) {
    if (req.file) {
      fs.unlink(req.file.path, err => {
        console.log(err)
      });
    }

    return res.status(422).json({ success: false, message: 'Username or Email already taken. Please select different Username or Email' });
   }

     const { username, email, password } = req.body;

     const createdUser = new User ({
         username,
         email,
         password,
         image: req.file.path,
         products:[],
         cart:[],
         orders:[]
     });

     
    
     //Hash password before saving in database
     bcrypt.genSalt(saltRounds, function(err, salt) {
       bcrypt.hash(createdUser.password, salt, (err, hash) => {
           try{
           createdUser.password = hash;
            createdUser
             .save()
         } catch (err) {
          if (req.file) {
            fs.unlink(req.file.path, err => {
              console.log(err)
            });
            return res.status(422).json({success: false, message: 'Whoops, something went wrong. Please try again later'})
          }}
         });
       });

     res.status(201).json({ user: createdUser})
};


//<------------------------login, no token needed ----------------------------------------->

const login = async (req, res, next) => {

    const { errors, isValid } = await validateLoginInput(req.fields);

    if (!isValid) {
      return res.status(400).json({success: false, message: 'Whoops, email or password invalid'});
    }
    let user;

      try {
       user = await User.findOne({ email : req.fields.email });
      } catch {
        return res.status(500).json({success: false, message: 'Whoops, something went wrong. Please try again later'})
      }

      if (isEmpty(user)) {
        return res.status(404).json({success: false, message: 'Whoops, email does not exist'})
      }
    
    
     bcrypt.compare(req.fields.password, user.password , function(err, result) {
          if (err){
            return res.status(500).json({success: false, message: 'Whoops,passwords do not match'});
          }
          if (result) {
              jwt.sign(
              { 
              id : user._id,
              user: user.username, 
              email: user.email 
                },
              keys.secretOrKey, 
              {expiresIn: "2h"}, 
              (err, token) => {
              if (err) {
                  return res.status(500).json({success: false, message: 'Whoops,generating token failed, please try again later'})
                }
              res.json({
              success: true, 
              token: "Bearer " + token,
                  });
                });
         } else {
           return res.status(500).json({success: false, message: 'Whoops,passwords do not match'});
         }
       });

      

     };

exports.getUser = getUser;
exports.updateUser = updateUser;
exports.signUp = signUp
exports.login = login
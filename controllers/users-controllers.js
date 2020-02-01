
const fs = require('fs');
const isEmpty = require('is-empty');
const jwt = require('jsonwebtoken');
const User = require("../models/user")
const keys = require('../config/keys')

const bcrypt = require("bcryptjs");
const validateLoginInput = require("../validation/login");
const validateToken = require('../validation/validatetoken');
const validateRegisterInput = require("../validation/register");

//<------------------------gets specific user, needs token as this will be the dashboard----------------------------------------->

 const getUser = async (req, res, next) => {

   const authHeaderValue = req.headers['authorization']

   if (!authHeaderValue) {
    return res.status(500).json('Session token not available');;
    }

  const token = await authHeaderValue.replace('Bearer: ', '')
  const { error, id } = await validateToken(token)

     if (error) {
      return res.status(404).json(error);
     } 

   let currentUser;

   try{
     currentUser = await User.find({ _id: id },'-password')
   } catch (e) {
    return res.status(500).json('Error retrieving user');
   }
  
  
   if (isEmpty(currentUser)) {
    return res.status(404).json('Cannot find user');
   }

     res.status(201).json({ currentUser })
 };

//<------------------------updates specific user, needs token----------------------------------------->

 const updateUser = async (req, res, next) => {
  let { username, email } = req.fields;
  const authHeaderValue = req.headers['authorization']
  
  if (!authHeaderValue) {
    return res.status(500).json('Session token not available');
   }

   let existingUserEmail
   let existingUsername
 
  try {
   existingUserEmail = await User.find({ email : email })
   existingUsername = await User.find({ username : username })
  } catch (err) {
    return res.status(500).json('Error retrieving user')
  }

  console.log(existingUserEmail)
 
  if (!isEmpty(existingUserEmail)) {
    return res.status(404).json("Email already exists! Please login instead")
  }
 
   if (!isEmpty(existingUsername)) {
    return res.status(404).json("Username already taken")
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
        return res.status(422).json(err)
        }
      }
    )

    res.status(201).json({ "Update" :  "Success" })
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
    return res.status(422).json(errors);
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

     const saltRounds = 12;
    
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
            return res.status(422).json(err)
          }}
         });
       });

     res.status(201).json({ user: createdUser})
};


//<------------------------login, no token needed ----------------------------------------->

const login = async (req, res, next) => {

    const { errors, isValid } = await validateLoginInput(req.fields);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    let user;

      try {
       user = await User.findOne({ email : req.fields.email });
      } catch {
        return res.status(500).json('Error retrieving user')
      }

      if (isEmpty(user)) {
        return res.status(404).json('Invalid email entered')
      }
    
    
     bcrypt.compare(req.fields.password, user.password, function(err, result) {
         if (err){
          console.log(err);
         }
         if (res) {
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
                 return res.sendStatus(403)
               }
               res.json({
                 success: true, 
                 token: "Bearer: " + token,
                     });
             });
         } else {
           return res.json({success: false, message: 'passwords do not match'});
         }
       });

     };

exports.getUser = getUser;
exports.updateUser = updateUser;
exports.signUp = signUp
exports.login = login
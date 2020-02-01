const Validator = require("validator");
const isEmpty = require("is-empty");
const User = require("../models/user")
const HttpError = require("../models/http-error")

module.exports = async function validateRegisterInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.username = !isEmpty(data.username) ? data.username : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  //username and email uniqueness test
  let existingUserEmail
  let existingUsername

try {
  existingUserEmail = await User.find({ email : data.email })
  existingUsername = await User.find({ username : data.username })
} catch (err) {
    errors.server = err.message
}

 if (!isEmpty(existingUserEmail)) {
    errors.email = "Email already exists! Please login instead"; 
 }

  if (!isEmpty(existingUsername)) {
    errors.username = "Username already taken";
  }

  if (Validator.isEmpty(data.username)) {
    errors.username = "Name field is required";
  }
// Email checks
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

// Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  }
return {
    errors,
    isValid: isEmpty(errors)
  };
};
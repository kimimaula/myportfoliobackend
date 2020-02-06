const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateItemInput(data) {

  let stringError = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.description = !isEmpty(data.description) ? data.description : "";
  data.price = !isEmpty(data.price) ? data.price : "";

// Email checks
  
if (Validator.isEmpty(data.title)) {
    stringError.title = "title field is required";
  }

if (Validator.isEmpty(data.description)) {
    stringError.description = "description field is required";
  }
  if (Validator.isEmpty(data.description)) {
    stringError.description = "description field is required";
  }
return {
    stringError,
    isValid: isEmpty(stringError)
  };
};
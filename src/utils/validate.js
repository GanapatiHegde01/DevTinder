const validator = require("validator");

const signUpValidator = (req) => {
  const data = req.body;

  if (!validator.isEmail(data.emailId)) {
    throw new Error("Please enter the valid email address");
  }
  if (!validator.isStrongPassword(data.password)) {
    throw new Error("Please enter the strong password");
  }

  const ALLOWED_GENDERS = ["Male", "Female", "Others"];

  if (!ALLOWED_GENDERS.includes(data.gender)) {
    throw new Error("Gender is not valid");
  }
};

const validateProfileEditData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "emailId",
    "skills",
    "about",
  ];
  const data = req.body;

  if (data.emailId!=null && !validator.isEmail(data.emailId)) {
    throw new Error("Invalid Eamil ID!");
  }
  if (data.profileurl!=null &&!validator.isURL(data.profileurl)) {
    throw new Error("Invalid Profile URL!");
  }

  const isEditValid = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  return isEditValid;
};



const isValidPassword = (passwordInputByUser)=>{
   
    if(!validator.isStrongPassword(passwordInputByUser)){
      throw new Error("Please Enter the Strong Password!")
    }

    return true;
}

module.exports = { signUpValidator, validateProfileEditData, isValidPassword };

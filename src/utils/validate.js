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

module.exports = { signUpValidator };

const mongoos = require("mongoose");

const userSchema = mongoos.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },

  lastName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },

  emailId: {
    type: String,
    lowercase:true,
    index:true,
    unique: true,
    minLength: 5,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minLength: 8,
  },

  age: {
    type: Number,
    required: true,
  },

  gender: {
    type: String,
    required: true,
    lowercase:true,
    validate(value) {
      if (!["male", "female", "others"].includes(value)) {
        throw new Error("Gender is not valid");
      }
    },
  },
  about: {
    type:String,
    default:"This is default added about"
  },
  skills: {
    type:[String],
  },
  

}, {timestamps:true});

const User = mongoos.model("User", userSchema);

module.exports = User;

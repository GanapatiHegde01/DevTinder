const mongoos = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

const userSchema = mongoos.Schema(
  {
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
      lowercase: true,
      index: true,
      unique: true,
      minLength: 5,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      required: true,
      lowercase: true,
    },
    about: {
      type: String,
      default: "This is default added about",
    },
    profileurl: {
      type: String,
      default:"https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "Secret@123");

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  return isPasswordValid;
};

const User = mongoos.model("User", userSchema);

module.exports = User;

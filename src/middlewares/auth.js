const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const app = express();


const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error("Token Expired");
    } else {
      const data = await jwt.verify(token, "Secret@123");

      const user = await User.findById(data._id);

      req.user = user;

      next();
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};
module.exports = { userAuth };

const express = require("express");

const app = express();

const auth = (err, req, res, next) => {
   
  if (err) {
    return res.status(500).send("Something went wrong!");
  }
  
  const token = "abc";
  if (token == "abc") {
    next();
  } else {
    res.send("Not Authenticated");
  }
};

module.exports = { auth };

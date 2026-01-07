const express = require("express");
const profileRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

//View Profile Details API
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    req.send("ERROR :" + err.message);
  }
});


module.exports = profileRouter;
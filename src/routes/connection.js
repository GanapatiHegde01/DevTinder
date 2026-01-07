const express = require("express");
const connectionRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

connectionRouter.post("/sendConnectionRequest", userAuth, (req, res) => {
  try {
    res.send(req.user.firstName + " " + "Connection request sent");
  } catch (err) {
    req.send("ERROR :" + err.message);
  }
});


module.exports = connectionRouter;
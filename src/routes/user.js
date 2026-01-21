const express = require("express");

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  const loggedInUser = req.user;

  const connectionRequests = await ConnectionRequest.find({
    toUserId: loggedInUser._id,
    status: "interested",
  }).populate("fromUserId", "firstName lastName age");

  res.json({
    message: "Connection requrests fetched Successfully!",
    data: connectionRequests,
  });
});

module.exports = userRouter;

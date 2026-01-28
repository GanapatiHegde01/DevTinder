const express = require("express");

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();
const USER_SAFE_FIELDS = "firstName lastName age gender about skills";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  const loggedInUser = req.user;

  const connectionRequests = await ConnectionRequest.find({
    toUserId: loggedInUser._id,
    status: "interested",
  }).populate("fromUserId", USER_SAFE_FIELDS);

  res.json({
    message: "Connection requrests fetched Successfully!",
    data: connectionRequests,
  });
});

userRouter.get("/user/requests/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .populate("toUserId", USER_SAFE_FIELDS);

    const data = connections.map((row) => {
      if (row.fromUserId._id.equals(loggedInUser._id)) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({
      message: "Connection Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_FIELDS)
      .skip(skip)
      .limit(limit);
    res.json({ data: users });
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = userRouter;

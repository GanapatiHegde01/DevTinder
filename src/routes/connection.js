const express = require("express");
const connectionRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const connectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");

connectionRouter.post(
  "/request/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const status = req.params.status;
      const toUserId = req.params.toUserId;

      const allowedStatus = ["ignore", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid Status");
      }

      const toUser = User.findOne({ toUserId });
      if (!toUser) {
        throw new Error("User not found !");
      }

      const existingConnectionRequest = await connectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exist!" });
      }

      const connectionRequest = new connectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });

      await connectionRequest.save();
      res.send("Connection request sent successfully!");
    } catch (err) {
      res.send("ERROR :" + err.message);
    }
  }
);

module.exports = connectionRouter;

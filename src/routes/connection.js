const express = require("express");
const connectionRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

//-----------------------------Send Connection Request API--------------------------

connectionRouter.post(
  "/request/send/:status/:toUserId",
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

      const existingConnectionRequest = await ConnectionRequest.findOne({
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

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.json({ message: "Connection request sent successfully!", data });
    } catch (err) {
      res.send("ERROR :" + err.message);
    }
  }
);

// ----------------------------------Accept Connection Request API---------------------------------------

connectionRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status is not valid" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        res.status(404).json({ message: "Connection request is not valid!" });
      }

      connectionRequest.status = status;
      await connectionRequest.save();
      return res
        .status(200)
        .json({ message: "Connection request Accepted", connectionRequest });
    } catch (err) {
      return res.status(400).json({ message: "ERROR:" + err.message });
    }
  }
);

module.exports = connectionRouter;

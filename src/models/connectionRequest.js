const mongoose = require("mongoose");

const connnectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enums: {
        values: ["ignore", "interested", "accepted", "rejected"],
        message: `{value} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);

connnectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connnectionRequestSchema.pre("save", function () {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("You cannont send request to yourself!");
  }
});

const connectionRequest = mongoose.model(
  "connectionRequest",
  connnectionRequestSchema
);

module.exports = connectionRequest;

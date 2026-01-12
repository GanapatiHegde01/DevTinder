const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");

const { validateProfileEditData } = require("../utils/validate");
const { isValidPassword } = require("../utils/validate");
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

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  if (validateProfileEditData(req)) {
    const loggedInUser = req.user;
    console.log(loggedInUser);

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    console.log(loggedInUser);
    res.send("Profile Updated succesfully");
    await loggedInUser.save();
  } else {
    res.status(400).send("Validation Failed");
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).send("All fields are required");
    }

    const isCurrentPasswordValid = await loggedInUser.validatePassword(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      res.status(400).send("Current Password is incorrect");
    }

    const isSamePassword = await loggedInUser.validatePassword(newPassword);
    if (isSamePassword) {
      res
        .status(400)
        .send("Current password and new password should not be same");
    }

    const isValidNewPassoword = isValidPassword(newPassword);
    if (!isValidNewPassoword) {
      res.status(400).send("Password doesn't meed the requirements");
    }

    const passwordHash = await bcrypt.hash(req.body.newPassword, 10);
    loggedInUser.password = passwordHash;
    await loggedInUser.save();
    res.send("Password Changed Succesfully!");
  } catch (error) {
    res.status(400).send("Failed to Change the password");
  }
});

module.exports = profileRouter;

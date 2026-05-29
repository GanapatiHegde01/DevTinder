const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");

const { validateProfileEditData } = require("../utils/validate");
const { isValidPassword } = require("../utils/validate");
const { userAuth } = require("../middlewares/auth");

const getSafeProfile = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  emailId: user.emailId,
  age: user.age,
  gender: user.gender,
  about: user.about,
  profileurl: user.profileurl,
  skills: user.skills,
});

//View Profile Details API
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json(getSafeProfile(user));
  } catch (err) {
    res.status(400).json({ message: "ERROR :" + err.message });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      return res.status(400).json({ message: "Validation Failed" });
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.json({
      message: "Profile Updated successfully",
      data: getSafeProfile(loggedInUser),
    });
  } catch (err) {
    res.status(400).json({ message: "ERROR :" + err.message });
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isCurrentPasswordValid = await loggedInUser.validatePassword(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      return res
        .status(400)
        .json({ message: "Current Password is incorrect" });
    }

    const isSamePassword = await loggedInUser.validatePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        message: "Current password and new password should not be same",
      });
    }

    const isValidNewPassoword = isValidPassword(newPassword);
    if (!isValidNewPassoword) {
      return res
        .status(400)
        .json({ message: "Password doesn't meet the requirements" });
    }

    const passwordHash = await bcrypt.hash(req.body.newPassword, 10);
    loggedInUser.password = passwordHash;
    await loggedInUser.save();
    res.json({ message: "Password Changed Successfully!" });
  } catch (error) {
    res.status(400).json({ message: "Failed to Change the password" });
  }
});

module.exports = profileRouter;

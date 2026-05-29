const express = require("express");
const authRouter = express.Router();

const { signUpValidator } = require("../utils/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const getSafeUser = (user) => ({
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

//Signup API
authRouter.post("/signup", async (req, res) => {
  try {
    signUpValidator(req);
    const { firstName, lastName, emailId, password, age, gender, skills } =
      req.body;

    const ALLOWED_FIELDS = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "emailId",
      "password",
      "skills",
    ];

    const isUserValid = Object.keys(req.body).every((k) =>
      ALLOWED_FIELDS.includes(k)
    );

    if (!isUserValid) {
      throw new Error("Invalid user");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
      skills,
    });

    await user.save();
    res.json({ message: "User added successfully", data: getSafeUser(user) });
  } catch (err) {
    res.status(400).json({ message: "Failed to add user: " + err.message });
  }
});

//Login API
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid Credentials");
    } else {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "lax",
      });
      res.json({ message: "Login successful", data: getSafeUser(user) });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Logout api

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Logout Successful !" });
});

module.exports = authRouter;

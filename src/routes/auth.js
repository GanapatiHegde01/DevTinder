const express = require("express");
const authRouter = express.Router();

const { signUpValidator } = require("../utils/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt");

//Signup API
authRouter.post("/signup", async (req, res) => {
  signUpValidator(req);
  const { firstName, lastName, emailId, password, age, gender, skills } =
    req.body;
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
  try {
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Failed to add user:" + err.message);
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
    const isPasswordValid = user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid Credentials");
    } else {
      const token = await user.getJWT();
      res.cookie("token", token, { expiresIn: "7d" });
      res.send("Login successful");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Logout api

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("Loggeed out");
});

module.exports = authRouter;

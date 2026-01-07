const express = require("express");
const connectDB = require("./config/database");
const { userAuth } = require("./middlewares/auth");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const User = require("./models/user");

const app = express();

connectDB()
  .then(() => {
    console.log("DB Connected Successfully");
    app.listen(7777, () => {
      console.log("Server Started Listening to port 7777");
    });
  })
  .catch((err) => {
    console.log("DB connection failed", err.message);
  });

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const request = require("./routes/connection");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", request);




app.get("/feed", async (req, res) => {
  try {
    const emailUser = req.body.emailId;
    const user = await User.find({ emailId: emailUser });
    if (user.length == 0) {
      res.status(400).send("User not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

app.put("/user", async (req, res) => {
  try {
    const { firstName } = req.body;
    const userUpdated = await User.updateMany(
      { firstName: firstName },

      { $set: { age: 29 } }
    );

    res.send("Updated Age");
  } catch (err) {
    res.status(400).send("Someting went wrong" + err.message);
  }
});

app.delete("/user", async (req, res) => {
  try {
    const { gender } = req.body;

    const userDeleted = await User.deleteOne({ gender: gender });

    res.send(`Deleted ${userDeleted.deletedCount} users`);
  } catch (err) {
    res.status(400).send("Someting went wrong" + err.message);
  }
});

app.get(
  "/admin",
  (req, res, next) => {
    throw new Error();
  },

  (req, res) => {
    console.log("Hey admin");
    res.send("Hello Admin");
  }
);

// Some notes

// app.get("/user/:id/:name", (req, res) => {
//   const params = {...req.params}
//    console.log(params);
//   res.send("Welcome user");
// });

// app.post("/us{e}r", (req, res) => {

//   res.send({
//     firstname: "Ganapati",
//     lastname: "Hegde",
//   });
// });
//   app.put(/\.com$/, (req, res) => {
//     res.send("Put method")
//   });

//   app.patch("/user", (req, res) => {
//     res.send("patch method");
//   });

//   app.delete("/user", (req, res) => {
//     res.send("delete method");
//   });

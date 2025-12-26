const express = require("express");
const connectDB = require("./config/database");
const { auth } = require("./middlewares/auth");
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

app.post("/signup", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Failed to add user:" + err.message);
  }
});

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

app.patch("/user", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, gender, age } = req.body;
    const userUpdated = await User.updateMany(
      { firstName: firstName },

      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          emailId: emailId,
          password: password,
          gender: gender,
          age: age,
        },
      },
      {
        runValidators: true,
      }
    );

    res.send(`Updated ${userUpdated.modifiedCount} User`);
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
  auth,
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

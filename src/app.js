const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello wordl");
});

app.listen(7777, () => {
  console.log("Server Started Listening to port 7777");
});

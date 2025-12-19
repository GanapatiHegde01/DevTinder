const express = require("express");
const app = express();
app.get("/user/:id/:name", (req, res) => {
  const params = {...req.params}
   console.log(params);
  res.send("Welcome user");
});

app.post("/us{e}r", (req, res) => {
 
  
  res.send({
    firstname: "Ganapati",
    lastname: "Hegde",
  });
});
  app.put(/\.com$/, (req, res) => {
    res.send("Put method")
  });

  app.patch("/user", (req, res) => {
    res.send("patch method");
  });

  app.delete("/user", (req, res) => {
    res.send("delete method");
  });

app.listen(7777, () => {
  console.log("Server Started Listening to port 7777");
});

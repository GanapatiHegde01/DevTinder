catch((err)=>{
    res.send("Failed to add user"+ err.message);
  })
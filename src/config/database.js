const mongoose = require("mongoose");                                                 
                                                                                      
async function connectDB() {                                                          
  await mongoose.connect(                                                             
    "mongodb+srv://namastedev:NHmXrx3r6YbqEIjA@cluster0.nmdv3im.mongodb.net/DevTinder"
  );                                                                                  
}                                                                                     
                                                                                      
                                                                                      
  module.exports = connectDB;                                                         
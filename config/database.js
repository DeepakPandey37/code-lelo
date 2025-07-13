const mongoose = require("mongoose");

require("dotenv").config(); 

exports.connect=()=> {
mongoose.connect(process.env.MONGO_URL).then( console.log("Database Connected Sucessfully")).catch( (error) =>{
    console.log("DB connection failed");
    console.log(error);
    process.exit(1);
});
};


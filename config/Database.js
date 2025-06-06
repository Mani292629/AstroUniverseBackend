const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then( () => {
        console.log("Database Connected Successfully..........")
    } )
    .catch( (error) => {
        console.log("Internal server error");
        console.error(error);
        process.exit(1);
    } );
}

module.exports = dbConnect;
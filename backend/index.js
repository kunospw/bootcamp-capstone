import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app.js";

mongoose
  .connect(
    "mongodb+srv://kindanervous:riePbQANRHbzN3h7@jobportal.mtmu2am.mongodb.net/"
  )
  .then(() => {
    console.log("database connected");
    app.listen(3000, () => {
      console.log("server is running on 3000");
    });
  })
  .catch((e) => {
    console.log("error: ", e.message);
  });

import mongoose from "mongoose";
import app from "./app.js";

mongoose
  .connect("mongodb://localhost:27017/bootcamp-project")
  .then(() => {
    console.log("database connected");
    app.listen(3000, () => {
      console.log("server is running on 3000");
    });
  })
  .catch((e) => {
    console.log("error: ", e.message);
  });

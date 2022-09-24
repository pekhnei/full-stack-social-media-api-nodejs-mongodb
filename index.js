const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRouter = require("./router/User");
const postRouter = require("./router/Post");
dotenv.config();

mongoose
  .connect(process.env.MONGODB)
  .then(() => console.log("DB connection successfully"))
  .catch(() => console.log("Some error occurred"));

app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);

app.listen(5000, () => {
  console.log("Server is running!");
});

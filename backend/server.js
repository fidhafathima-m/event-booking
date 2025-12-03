
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./src/app.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

let server;
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    server = app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection error", err);
    process.exit(1);
  });

// handle rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  if (server) server.close(() => process.exit(1));
});


import express from "express";
import { addEmailToQueue } from "./Queue.js";
import { configDotenv } from "dotenv";
configDotenv();
const app = express();

app.use(express.json());






app.post("/send-email", (req, res) => {
  const { to, subject, text } = req.body;

  addEmailToQueue(to, subject, text);

  res.status(200).send("Email job added to queue!");
});



app.listen(5000, () => {
  console.log("server is listeining on port 5000");
});

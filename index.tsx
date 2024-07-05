import express from "express";

import BodyParser from "body-parser";

import * as FirebaseService from "./FirebaseService";
import Expo from "expo-server-sdk";
import { CronJob } from "cron";

const app = express();
const port = 8000;
const address = '127.0.0.1';

const expo = new Expo();
const cors = require('cors');


const jsonParser = BodyParser.json();
const httpParser = BodyParser.urlencoded({ extended: false });

// new CronJob(
//   "*/60 * * * * *",
//   async function () {
//     const userId = "0000001";
//     const { token } = await FirebaseService.getToken("0000001");
//     const samples = await FirebaseService.getSamples(userId);
//     const mostRecentSample = samples.previousMoistureLevels.pop();
//     if (mostRecentSample > 570) {
//       expo.sendPushNotificationsAsync([
//         {
//           to: token,
//           title: "Soil Water Level too Low!",
//           body: "Water Your Plant",
//         },
//       ]);
//     }
//   },
//   null,
//   true,
//   "America/New_York"
// );

app.use(cors({
  origin: 'http://localhost:3000', // Replace with allowed origin(s)
  credentials: true // Allow cookies for cross-origin requests (optional)
}));

app.post("/registerPushToken", jsonParser, async (req, res) => {
  const userId = String(req.body.userId);
  const token = String(req.body.token);
  await FirebaseService.saveToken(userId, token);
  res.status(200).send("success");
});

app.post("/SendNotificationOfNewQuote", jsonParser, async (req, res) => {
  const title = String(req.body.title);
  const body = String(req.body.body);
  const users = await FirebaseService.getAllUsers()

  let notifications: { to: string; title: string; body: string; }[] = [];

  users.forEach(item => {
    notifications.push({
      to: item.toString(),
      title: title,
      body: body,
    })
  })

  await expo.sendPushNotificationsAsync(notifications);
  res.status(200).send("SUCCESS");

})

app.post(`/sample`, jsonParser, async (req, res) => {
  const moistureLevel = Number(req.body.moisture);
  const userId = String(req.body.userId);
  FirebaseService.saveSample(moistureLevel, userId);
  res.status(200).send("success");
});

app.get("/analytics", httpParser, async (req, res) => {
  const userId = String(req.query.userId);
  const samples = await FirebaseService.getSamples(userId);
  res.status(200).send(samples);
});

app.listen(port, address, () => console.log(`Running on Port ${port}`));

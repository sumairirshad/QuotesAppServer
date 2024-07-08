const express = require("express");

const BodyParser = require("body-parser");

const FirebaseService = require("./FirebaseService");
const {Expo} = require("expo-server-sdk");

const app = express();
const port = 8000;
const address = '127.0.0.1';

const expo = new Expo();
const cors = require('cors');


const jsonParser = BodyParser.json();
const httpParser = BodyParser.urlencoded({ extended: false });

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

  let notifications = [];

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

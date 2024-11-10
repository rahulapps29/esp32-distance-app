// app.js
const express = require("express");
const mqtt = require("mqtt");
const path = require("path");

const app = express();
const PORT = 3000;

// MQTT Server Details
const MQTT_SERVER = "http://223.239.128.54";
const MQTT_USERNAME = "rahul";
const MQTT_PASSWORD = "rahul";
const REQUEST_TOPIC = "sensor/request";
const RESPONSE_TOPIC = "sensor/distance";

let distance = null;

// MQTT Client Setup
const mqttClient = mqtt.connect(MQTT_SERVER, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
});

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe(RESPONSE_TOPIC, (err) => {
    if (err) {
      console.error("Failed to subscribe to response topic:", err);
    } else {
      console.log(`Subscribed to ${RESPONSE_TOPIC}`);
    }
  });
});

// Handle incoming MQTT messages
mqttClient.on("message", (topic, message) => {
  if (topic === RESPONSE_TOPIC) {
    distance = message.toString();
    console.log(`Received distance: ${distance}`);
  }
});

// Endpoint to request distance from ESP32
app.get("/get-distance", (req, res) => {
  distance = null; // Reset distance before request
  mqttClient.publish(REQUEST_TOPIC, ""); // Trigger ESP32 to measure distance
  setTimeout(() => {
    if (distance) {
      res.json({ distance: `${distance} cm` });
    } else {
      res.status(500).json({ error: "Failed to retrieve distance" });
    }
  }, 3000); // Wait 3 seconds for response
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import fetch from "node-fetch"; // for fetching from rest APIs
import mqtt from "mqtt"; // for connecting to mqtt

// Call to remote REST API
const FortuneCookie = {
  getOne() {
    return fetch("http://fortunecookieapi.herokuapp.com/v1/cookie")
      .then(res => res.json())
      .then(res => {
        return res[0].fortune.message;
      });
  }
};

// Call to MQTT servers
// let client = mqtt.connect("tcp://localhost:1883");

// client.on("connect", () => {
//   client.subscribe("presence");
//   client.publish("presence", "Hello mqtt");
// });

// client.on("message", (topic, message) => {
//   console.log(message.toString());
//   client.end();
// });

export { FortuneCookie };

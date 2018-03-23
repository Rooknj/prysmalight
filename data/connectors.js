import fetch from "node-fetch"; // for fetching from rest APIs
import mqtt from "async-mqtt"; // for connecting to mqtt

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

//Call to MQTT servers
let client = mqtt.connect("tcp://localhost:1883");

client.on("connect", async () => {
  console.log("Starting");
  try {
    await client.publish("wow/so/cool", "It works!");
    // This line doesn't run until the server responds to the publish
    await client.end();
    // This line doesn't run until the client has disconnected without error
    console.log("Done");
  } catch (e) {
    // Do something about it!
    console.log(e.stack);
    process.exit();
  }
});

export { FortuneCookie };

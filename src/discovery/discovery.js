const createDiscoveryService = (mediator, mqttClient) => {
  let self;

  const start = async () => {
    console.log("Start Discovery");
    //message
    mqttClient.on("message", console.log);

    //pub
    try {
      const granted = await mqttClient.subscribe("prysmalight/+/config");
      if (!granted[0]) {
        console.log(`Subscription not granted`);
      } else {
        console.log(
          `Subscribed to ${granted[0].topic} with a qos of ${granted[0].qos}`
        );
      }
    } catch (error) {
      console.log(error);
    }

    //sub
    try {
      await mqttClient.publish("prysmalight/discovery", "Hello");
      console.log(`Published hello to discovery`);
    } catch (error) {
      return error;
    }
  };

  const stop = () => {
    console.log("Stop Discovery");
    //client.unsubscribe(topic);
  };

  const getDiscoveredLights = () => {};

  self = { start, stop, getDiscoveredLights };

  return Object.assign({}, self);
};

module.exports = { createDiscoveryService };

import { connect } from "mqtt";
import { MQTTPubSub, SubscriptionManager } from "graphql-mqtt-subscriptions"; // for connecting to mqtt
import { PubSub } from "graphql-subscriptions";

//Call to MQTT servers
/*
const client = connect("tcp://localhost:1883", {
  reconnectPeriod: 1000,
});
*/
const MQTT_CLIENT = "tcp://broker.hivemq.com:1883";

const client = connect(MQTT_CLIENT, {
  reconnectPeriod: 1000
});

const connectionListener = connection => {
  if (connection) {
    console.log("Connected to", MQTT_CLIENT);
    //console.log(connection);
  } else {
    console.log("Failed to connect to", MQTT_CLIENT);
  }
};

const onMQTTSubscribe = (subId, granted) => {
  console.log(`Subscription with id ${subId} was given QoS of ${granted.qos}`);
};

const pubsub = new MQTTPubSub({ client, connectionListener, onMQTTSubscribe });

class LightConnector {
  constructor() {
    this.lights = [
      {
        id: "Light 1",
        power: false,
        brightness: 100,
        color: { r: 0, g: 1, b: 2 }
      },
      {
        id: "Light 2",
        power: false,
        brightness: 100,
        color: { r: 0, g: 1, b: 2 }
      }
    ];
  }

  getLight = lightId => {
    const subTopic = "LIGHT_STATE_TOPIC";
    const pubTopic = "GET_LIGHT_STATE_TOPIC";
    let unsubscribeId;
    console.log("Getting light");

    return new Promise((resolve, reject) => {
      // Resolve the promise when we receive an MQTT response
      const onMessage = data => {
        pubsub.unsubscribe(unsubscribeId);
        //console.log("Unsubscribed subscription", unsubscribeId, "from", subTopic)
        resolve(Object.assign(data, {id: "Light 1"}))
      };
      // Only send an MQTT message to the ESP8266 once we are subscribed to the response topic
      const onSubscribe = subId => {
        unsubscribeId = subId;
        pubsub.publish(pubTopic, {sendState: true})
      };
      // If the subscribe function errors, do something
      const onError = error => console.log(error);
      // Subscribe to the response topic
      pubsub.subscribe(subTopic, onMessage).then(onSubscribe).catch(onError);
    });
  };

  setLight = light => {
    const subTopic = "LIGHT_CHANGED_TOPIC";
    const pubTopic = "CHANGE_LIGHT_TOPIC";
    let unsubscribeId;

    return new Promise((resolve, reject) => {
      // Resolve the promise when we receive an MQTT response
      const onMessage = data => {
        pubsub.unsubscribe(unsubscribeId);
        //console.log("Unsubscribed subscription", unsubscribeId, "from", subTopic)
        resolve(Object.assign(data, {id: "Light 1"}))
      };
      // Only send an MQTT message to the ESP8266 once we are subscribed to the response topic
      const onSubscribe = subId => {
        unsubscribeId = subId;
        pubsub.publish(pubTopic, light)
      };
      // If the subscribe function errors, do something
      const onError = error => console.log(error);
      // Subscribe to the response topic
      pubsub.subscribe(subTopic, onMessage).then(onSubscribe).catch(onError);
    });
  };

  subscribeLight = topic => {
    return pubsub.asyncIterator(topic);
  };

  getLights = () => {
    console.log("Getting lights");
    return [this.getLight("Light 1")];
  };
}

export { LightConnector };

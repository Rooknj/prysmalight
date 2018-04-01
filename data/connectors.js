import fetch from "node-fetch"; // for fetching from rest APIs
import { connect } from 'mqtt';
import { MQTTPubSub, SubscriptionManager } from 'graphql-mqtt-subscriptions'; // for connecting to mqtt
import { PubSub } from 'graphql-subscriptions';
import schema from './schema';
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
const client = connect("tcp://localhost:1883", {
  reconnectPeriod: 1000,
});

const onMQTTSubscribe = (subId, granted) => {
  console.log(`Subscription with id ${subId} was given QoS of ${granted.qos}`);
}

const pubsub = new MQTTPubSub({client, onMQTTSubscribe});
/*
const subscriptionManager = new SubscriptionManager({
  schema,
  pubsub,
  setupFunctions: {},
});
*/

export { FortuneCookie, pubsub };

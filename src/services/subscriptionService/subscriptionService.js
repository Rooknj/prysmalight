"use strict";
const {
  LIGHT_ADDED,
  LIGHT_REMOVED,
  LIGHT_CHANGED
} = require("../eventConstants");
const mediator = require("../mediator");
const { PubSub } = require("graphql-subscriptions");

class subscriptionService {
  constructor() {
    this.gqlPubSub = new PubSub();
    this.mediator = mediator;
    this.mediator.subscribe(LIGHT_ADDED, this.onLightAdded.bind(this));
    this.mediator.subscribe(LIGHT_REMOVED, this.onLightRemoved.bind(this));
    this.mediator.subscribe(LIGHT_CHANGED, this.onLightChanged.bind(this));
  }

  /**
   * Subscribes to the changes of a specific light.
   * @param {string} lightId
   */
  subscribeToLight(lightId) {
    return this.gqlPubSub.asyncIterator(lightId);
  }

  /**
   * Subscribes to the changes of all lights.
   */
  subscribeToAllLights() {
    return this.gqlPubSub.asyncIterator(LIGHT_CHANGED);
  }

  /**
   * Subscribes to lights being added.
   */
  subscribeToLightsAdded() {
    return this.gqlPubSub.asyncIterator(LIGHT_ADDED);
  }

  /**
   * Subscribes to lights being removed.
   */
  subscribeToLightsRemoved() {
    return this.gqlPubSub.asyncIterator(LIGHT_REMOVED);
  }

  onLightAdded({ lightAdded }) {
    this.gqlPubSub.publish(LIGHT_ADDED, {
      lightAdded
    });
  }

  onLightRemoved({ lightRemoved }) {
    this.gqlPubSub.publish(LIGHT_REMOVED, {
      lightRemoved
    });
  }

  onLightChanged({ lightChanged }) {
    this.gqlPubSub.publish(LIGHT_CHANGED, {
      lightsChanged: lightChanged
    });
    this.gqlPubSub.publish(lightChanged.id, {
      lightChanged
    });
  }
}

module.exports = subscriptionService;

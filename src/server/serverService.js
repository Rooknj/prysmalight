"use strict";
const {
  GET_LIGHT,
  GET_LIGHTS,
  SET_LIGHT,
  ADD_LIGHT,
  REMOVE_LIGHT,
  LIGHT_ADDED,
  LIGHT_REMOVED,
  LIGHT_CHANGED
} = require("../eventConstants");

const UPDATE_TIMEOUT = 120000; // 2 minutes
const REBOOT_TIMEOUT = 5000;
const REPO_TIMEOUT = 5000;
const REPO_TIMEOUT_MESSAGE = `Repository timed out after ${REPO_TIMEOUT}ms`;

const serviceFactory = (mediator, gqlPubSub) => {
  let self = {};

  const getLight = lightId => {
    return mediator.sendRpcMessage(
      GET_LIGHT,
      { lightId },
      { timeout: REPO_TIMEOUT, timeoutMessage: REPO_TIMEOUT_MESSAGE }
    );
  };
  const getLights = () => {
    return mediator.sendRpcMessage(GET_LIGHTS, null, {
      timeout: REPO_TIMEOUT,
      timeoutMessage: "getLight response Timed Out"
    });
  };
  const setLight = (lightId, lightData) => {
    return mediator.sendRpcMessage(
      SET_LIGHT,
      { lightId, lightData },
      { timeout: REPO_TIMEOUT, timeoutMessage: REPO_TIMEOUT_MESSAGE }
    );
  };
  const addLight = lightId => {
    return mediator.sendRpcMessage(
      ADD_LIGHT,
      { lightId },
      { timeout: REPO_TIMEOUT, timeoutMessage: REPO_TIMEOUT_MESSAGE }
    );
  };
  const removeLight = lightId => {
    return mediator.sendRpcMessage(
      REMOVE_LIGHT,
      { lightId },
      { timeout: REPO_TIMEOUT, timeoutMessage: REPO_TIMEOUT_MESSAGE }
    );
  };
  const updateHub = () => {
    return new Promise(resolve => {
      resolve(new Error("Not Implemented Yet"));
    });
  };
  const rebootHub = () => {
    return new Promise(resolve => {
      resolve(new Error("Not Implemented Yet"));
    });
  };

  /**
   * Subscribes to the changes of a specific light.
   * @param {string} lightId
   */
  const subscribeToLight = lightId => gqlPubSub.asyncIterator(lightId);

  /**
   * Subscribes to the changes of all lights.
   */
  const subscribeToAllLights = () => gqlPubSub.asyncIterator(LIGHT_CHANGED);

  /**
   * Subscribes to lights being added.
   */
  const subscribeToLightsAdded = () => gqlPubSub.asyncIterator(LIGHT_ADDED);

  /**
   * Subscribes to lights being removed.
   */
  const subscribeToLightsRemoved = () => gqlPubSub.asyncIterator(LIGHT_REMOVED);

  const onLightAdded = msg => {
    console.log("light added", msg);
    // gqlPubSub.publish(LIGHT_ADDED, {
    //   lightAdded
    // });
  };

  const onLightRemoved = msg => {
    console.log("light removed", msg);
  };

  const onLightChanged = msg => {
    console.log("light changed", msg);
  };

  mediator.subscribe(LIGHT_ADDED, onLightAdded);
  mediator.subscribe(LIGHT_REMOVED, onLightRemoved);
  mediator.subscribe(LIGHT_CHANGED, onLightChanged);

  self = {
    getLight,
    getLights,
    setLight,
    addLight,
    removeLight,
    subscribeToLight,
    subscribeToAllLights,
    subscribeToLightsAdded,
    subscribeToLightsRemoved,
    updateHub,
    rebootHub
  };

  return Object.assign({}, self);
};

module.exports = serviceFactory;

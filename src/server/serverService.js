"use strict";
const {
  GET_LIGHT,
  GET_LIGHTS,
  GET_DISCOVERED_LIGHTS,
  SET_LIGHT,
  ADD_LIGHT,
  REMOVE_LIGHT,
  LIGHT_ADDED,
  LIGHT_REMOVED,
  LIGHT_CHANGED,
  UPDATE_HUB,
  REBOOT_HUB
} = require("../eventConstants");

const UPDATE_TIMEOUT = 110000; // a little less than 2 minutes
const UPDATE_TIMEOUT_MESSAGE = `Update timed out after ${UPDATE_TIMEOUT}ms`;
const REBOOT_TIMEOUT = 5000;
const REBOOT_TIMEOUT_MESSAGE = `Reboot timed out after ${REBOOT_TIMEOUT}ms`;
const REPO_TIMEOUT = 5000;
const REPO_TIMEOUT_MESSAGE = `Repository timed out after ${REPO_TIMEOUT}ms`;

const serviceFactory = (mediator, gqlPubSub) => {
  let self = {};

  const getLight = async lightId => {
    try {
      const data = await mediator.sendRpcMessage(
        GET_LIGHT,
        { lightId },
        { timeout: REPO_TIMEOUT, timeoutMessage: REPO_TIMEOUT_MESSAGE }
      );
      return data;
    } catch (e) {
      return e;
    }
  };
  const getLights = async () => {
    try {
      const data = await mediator.sendRpcMessage(GET_LIGHTS, null, {
        timeout: REPO_TIMEOUT,
        timeoutMessage: "getLight response Timed Out"
      });
      return data;
    } catch (e) {
      return e;
    }
  };
  const getDiscoveredLights = async () => {
    try {
      const data = await mediator.sendRpcMessage(GET_DISCOVERED_LIGHTS, null, {
        timeout: REPO_TIMEOUT,
        timeoutMessage: "getDiscoveredLights response Timed Out"
      });
      return data;
    } catch (e) {
      return e;
    }
  };
  const setLight = async (lightId, lightData) => {
    try {
      const data = await mediator.sendRpcMessage(
        SET_LIGHT,
        { lightId, lightData },
        { timeout: REPO_TIMEOUT, timeoutMessage: REPO_TIMEOUT_MESSAGE }
      );
      return data;
    } catch (e) {
      return e;
    }
  };
  const addLight = async lightId => {
    try {
      const data = await mediator.sendRpcMessage(
        ADD_LIGHT,
        { lightId },
        { timeout: REPO_TIMEOUT, timeoutMessage: REPO_TIMEOUT_MESSAGE }
      );
      return data;
    } catch (e) {
      return e;
    }
  };
  const removeLight = async lightId => {
    try {
      const data = await mediator.sendRpcMessage(
        REMOVE_LIGHT,
        { lightId },
        { timeout: REPO_TIMEOUT, timeoutMessage: REPO_TIMEOUT_MESSAGE }
      );
      return data;
    } catch (e) {
      return e;
    }
  };
  const updateHub = async () => {
    try {
      const { error, data } = await mediator.sendRpcMessage(UPDATE_HUB, null, {
        timeout: UPDATE_TIMEOUT,
        timeoutMessage: UPDATE_TIMEOUT_MESSAGE,
        remote: true
      });
      if (error) return new Error(error);
      return data;
    } catch (e) {
      return e;
    }
  };
  const rebootHub = async () => {
    try {
      const { error, data } = await mediator.sendRpcMessage(REBOOT_HUB, null, {
        timeout: REBOOT_TIMEOUT,
        timeoutMessage: REBOOT_TIMEOUT_MESSAGE,
        remote: true
      });
      if (error) return new Error(error);
      return data;
    } catch (e) {
      return e;
    }
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

  const onLightAdded = ({ lightAdded }) =>
    gqlPubSub.publish(LIGHT_ADDED, {
      lightAdded
    });

  const onLightRemoved = ({ lightRemoved }) =>
    gqlPubSub.publish(LIGHT_REMOVED, {
      lightRemoved
    });

  const onLightChanged = ({ lightChanged }) => {
    gqlPubSub.publish(LIGHT_CHANGED, {
      lightsChanged: lightChanged
    });
    gqlPubSub.publish(lightChanged.id, {
      lightChanged
    });
  };

  mediator.subscribe(LIGHT_ADDED, onLightAdded);
  mediator.subscribe(LIGHT_REMOVED, onLightRemoved);
  mediator.subscribe(LIGHT_CHANGED, onLightChanged);

  self = {
    getLight,
    getLights,
    getDiscoveredLights,
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

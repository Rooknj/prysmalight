import React from "react";
import PropTypes from "prop-types";
import {
  LIGHTS_CHANGED,
  LIGHT_ADDED,
  LIGHT_REMOVED
} from "../graphqlConstants";
import LightList from "./LightList";

const propTypes = {
  lights: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      connected: PropTypes.number,
      state: PropTypes.string,
      brightness: PropTypes.number,
      color: PropTypes.shape({
        r: PropTypes.number.isRequired,
        g: PropTypes.number.isRequired,
        b: PropTypes.number.isRequired
      }),
      effect: PropTypes.string,
      speed: PropTypes.number,
      supportedEffects: PropTypes.array
    })
  ),
  subscribeToLightChanges: PropTypes.func
};

const defaultProps = {
  subscribeToLightChanges: () => {}
};

const addLightToQuery = (cacheData, { subscriptionData }) => {
  // If no data was returned, do nothing
  if (!subscriptionData) return cacheData;
  // Find the id of the new light
  const newLight = subscriptionData.data.lightAdded;
  // If the light already exists in the cache, do nothing
  if (cacheData.lights.find(light => light.id === newLight.id)) {
    return cacheData;
  }
  // If the light doesnt exist, add it to the cache
  return Object.assign({}, cacheData, {
    lights: [...cacheData.lights, newLight]
  });
};

const removeLightFromQuery = (cacheData, { subscriptionData }) => {
  // If no data was returned, do nothing
  if (!subscriptionData) return cacheData;

  // Find the index of the light to be removed and remove it
  const lightToRemove = subscriptionData.data.lightRemoved;
  return Object.assign({}, cacheData, {
    lights: cacheData.lights.filter(light => light.id !== lightToRemove)
  });
};

class LightListSubscriptionContainer extends React.Component {
  componentDidMount() {
    this.props.subscribeToLightChanges({
      document: LIGHTS_CHANGED
    });
    this.props.subscribeToLightChanges({
      document: LIGHT_ADDED,
      updateQuery: addLightToQuery
    });
    this.props.subscribeToLightChanges({
      document: LIGHT_REMOVED,
      updateQuery: removeLightFromQuery
    });
  }

  render() {
    const { lights } = this.props;
    return <LightList lights={lights} />;
  }
}

LightListSubscriptionContainer.propTypes = propTypes;
LightListSubscriptionContainer.defaultProps = defaultProps;

export default LightListSubscriptionContainer;

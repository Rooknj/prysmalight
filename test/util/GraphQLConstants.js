const { gql } = require("apollo-server");

const LIGHT_DATA = gql`
  fragment lightData on Light {
    id
    connected
    state
    brightness
    color {
      r
      g
      b
    }
    effect
    speed
    supportedEffects
  }
`;

const LIGHT_ADDED = gql`
  subscription lightAdded {
    lightAdded {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

const LIGHT_REMOVED = gql`
  subscription lightRemoved {
    lightRemoved {
      id
    }
  }
`;

const LIGHTS_CHANGED = gql`
  subscription lightsChanged {
    lightsChanged {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

const GET_LIGHTS = gql`
  query getLights {
    lights {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

const SET_LIGHT = gql`
  mutation setLight($light: LightInput!) {
    setLight(light: $light) {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

const ADD_LIGHT = gql`
  mutation addLight($lightId: String!) {
    addLight(lightId: $lightId) {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

const REMOVE_LIGHT = gql`
  mutation removeLight($lightId: String!) {
    removeLight(lightId: $lightId) {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

module.exports = {
  LIGHT_ADDED,
  LIGHT_REMOVED,
  LIGHTS_CHANGED,
  GET_LIGHTS,
  SET_LIGHT,
  ADD_LIGHT,
  REMOVE_LIGHT
};

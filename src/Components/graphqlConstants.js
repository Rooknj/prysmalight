import gql from "graphql-tag";

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

export const LIGHTS_CHANGED = gql`
  subscription lightsChanged {
    lightsChanged {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

export const GET_LIGHTS = gql`
  query getLights {
    lights {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

export const SET_LIGHT = gql`
  mutation setLight($light: LightInput!) {
    setLight(light: $light) {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

export const ADD_LIGHT = gql`
  mutation addLight($lightId: String!) {
    addLight(lightId: $lightId) {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

export const REMOVE_LIGHT = gql`
  mutation removeLight($lightId: String!) {
    removeLight(lightId: $lightId) {
      ...lightData
    }
  }
  ${LIGHT_DATA}
`;

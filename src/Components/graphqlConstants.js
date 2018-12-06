import gql from "graphql-tag";

const LIGHT_FIELDS = gql`
  fragment lightFields on Light {
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

export const LIGHT_ADDED = gql`
  subscription lightAdded {
    lightAdded {
      ...lightFields
    }
  }
  ${LIGHT_FIELDS}
`;

export const LIGHT_REMOVED = gql`
  subscription lightRemoved {
    lightRemoved
  }
`;

export const LIGHTS_CHANGED = gql`
  subscription lightsChanged {
    lightsChanged {
      ...lightFields
    }
  }
  ${LIGHT_FIELDS}
`;

export const GET_LIGHTS = gql`
  query getLights {
    lights {
      ...lightFields
    }
  }
  ${LIGHT_FIELDS}
`;

export const SET_LIGHT = gql`
  mutation setLight($lightId: String!, $lightData: LightInput!) {
    setLight(lightId: $lightId, lightData: $lightData) {
      ...lightFields
    }
  }
  ${LIGHT_FIELDS}
`;

export const ADD_LIGHT = gql`
  mutation addLight($lightId: String!) {
    addLight(lightId: $lightId) {
      ...lightFields
    }
  }
  ${LIGHT_FIELDS}
`;

export const REMOVE_LIGHT = gql`
  mutation removeLight($lightId: String!) {
    removeLight(lightId: $lightId)
  }
`;

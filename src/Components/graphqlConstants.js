import gql from "graphql-tag";

export const LIGHT_CHANGED = gql`
    subscription lightChanged($lightId: String!) {
        lightChanged(lightId: $lightId) {
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
    }
`;

export const GET_LIGHTS = gql`
    query getLights {
        lights {
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
    }
`;

export const SET_LIGHT = gql`
    mutation setLight($light: LightInput!) {
        setLight(light: $light) {
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
    }
`;

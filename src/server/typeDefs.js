const { gql } = require("apollo-server");

const Query = gql`
  type Query {
    light(lightId: String!): Light
    lights: [Light]
  }
`;

const Mutation = gql`
  type Mutation {
    setLight(lightID: String!, lightData: LightInput!): Light
    addLight(lightId: String!): Light
    removeLight(lightId: String!): Light
  }
`;

const Subscription = gql`
  type Subscription {
    lightChanged(lightId: String!): Light
    lightsChanged: Light
    lightAdded: Light
    lightRemoved: String
  }
`;

const Light = gql`
  type Light {
    id: String # uique name of accessory
    connected: Int
    state: String # curent power status
    brightness: Int # current brightness
    color: Color # current color
    effect: String # current effect
    speed: Int # effect speed
    supportedEffects: [String] # List of supported effects
  }
`;

const LightInput = gql`
  input LightInput {
    state: String
    brightness: Int
    color: ColorInput
    effect: String
    speed: Int
  }
`;

const Color = gql`
  type Color {
    r: Int!
    g: Int!
    b: Int!
  }
`;

const ColorInput = gql`
  input ColorInput {
    r: Int!
    g: Int!
    b: Int!
  }
`;

const typeDefs = [
  Query,
  Mutation,
  Subscription,
  Light,
  LightInput,
  Color,
  ColorInput
];

module.exports = typeDefs;

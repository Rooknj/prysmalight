"use strict";
const { gql } = require("apollo-server");

const Query = gql`
  type Query {
    light(lightId: String!): Light
    lights: [Light]
    discoveredLights: [DiscoveredLight]
  }
`;

const Mutation = gql`
  type Mutation {
    setLight(lightId: String!, lightData: LightInput!): Light
    addLight(lightId: String!): Light
    removeLight(lightId: String!): String
    updateHub: String
    rebootHub: String
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
    configuration: LightConfig
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

const DiscoveredLight = gql`
  type DiscoveredLight {
    id: String!
    ipAddress: String
    macAddress: String
    numLeds: Int
    udpPort: Int
    version: String
    hardware: String
    colorOrder: String
    stripType: String
  }
`;

const LightConfig = gql`
  type LightConfig {
    ipAddress: String
    macAddress: String
    numLeds: Int
    udpPort: Int
    version: String
    hardware: String
    colorOrder: String
    stripType: String
  }
`;

const typeDefs = [
  Query,
  Mutation,
  Subscription,
  Light,
  LightInput,
  Color,
  ColorInput,
  DiscoveredLight,
  LightConfig
];

module.exports = typeDefs;

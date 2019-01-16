import React from "react";
import { shallow } from "enzyme";
import LightStateContainer from "./LightStateContainer";

const MOCK_LIGHT = {
  id: "LightStateContainerTest",
  state: "ON",
  connected: 2,
  brightness: 76,
  color: {
    r: 255,
    g: 0,
    b: 35
  },
  effect: "None",
  speed: 5,
  supportedEffects: []
};

it("renders without crashing", () => {
  shallow(<LightStateContainer light={MOCK_LIGHT} />);
});

it("calls setLight with the correct variables when handleStateChange is called", () => {
  const setLightSpy = jest.fn(),
    wrapper = shallow(
      <LightStateContainer light={MOCK_LIGHT} setLight={setLightSpy} />
    ),
    mockEvent = { target: { checked: true } },
    expectedArguments = {
      lightId: MOCK_LIGHT.id,
      lightData: { state: "ON" }
    };

  wrapper.instance().handleStateChange(mockEvent); // Call method
  expect(setLightSpy).toHaveBeenCalledTimes(1);
  const args = setLightSpy.mock.calls[0][0]; // Get the arguments that setLight was called with
  expect(args).toHaveProperty("variables", expectedArguments);
});

it("calls setLight with the correct arguments when handleBrightnessChange is called", () => {
  const setLightSpy = jest.fn(),
    wrapper = shallow(
      <LightStateContainer light={MOCK_LIGHT} setLight={setLightSpy} />
    ),
    mockBrightness = 32,
    expectedArguments = {
      lightId: MOCK_LIGHT.id,
      lightData: { brightness: mockBrightness }
    };

  wrapper.instance().handleBrightnessChange({}, mockBrightness); // Call method
  expect(setLightSpy).toHaveBeenCalledTimes(1);
  const args = setLightSpy.mock.calls[0][0]; // Get the arguments that setLight was called with
  expect(args).toHaveProperty("variables", expectedArguments);
});

it("calls setLight with the correct arguments when handleColorChange is called and the color is different", () => {
  const setLightSpy = jest.fn(),
    wrapper = shallow(
      <LightStateContainer light={MOCK_LIGHT} setLight={setLightSpy} />
    ),
    mockColor = { rgb: { r: 0, g: 100, b: 28 } },
    expectedArguments = {
      lightId: MOCK_LIGHT.id,
      lightData: { color: mockColor.rgb }
    };

  wrapper.instance().handleColorChange(mockColor); // Call method
  expect(setLightSpy).toHaveBeenCalledTimes(1);
  const args = setLightSpy.mock.calls[0][0]; // Get the arguments that setLight was called with
  expect(args).toHaveProperty("variables", expectedArguments);
});

it("does not call setLight when handleColorChange is called and the color is the same", () => {
  const setLightSpy = jest.fn(),
    wrapper = shallow(
      <LightStateContainer light={MOCK_LIGHT} setLight={setLightSpy} />
    ),
    mockColor = { rgb: MOCK_LIGHT.color };

  wrapper.instance().handleColorChange(mockColor); // Call method
  expect(setLightSpy).toHaveBeenCalledTimes(0);
});

it("calls setLight with the correct arguments when handleEffectChange is called", () => {
  const setLightSpy = jest.fn(),
    wrapper = shallow(
      <LightStateContainer light={MOCK_LIGHT} setLight={setLightSpy} />
    ),
    mockEffect = "Flash",
    expectedArguments = {
      lightId: MOCK_LIGHT.id,
      lightData: { effect: mockEffect }
    };

  wrapper.instance().handleEffectChange(mockEffect); // Call method
  expect(setLightSpy).toHaveBeenCalledTimes(1);
  const args = setLightSpy.mock.calls[0][0]; // Get the arguments that setLight was called with
  expect(args).toHaveProperty("variables", expectedArguments);
});

it("calls setLight with the correct arguments when handleSpeedChange is called", () => {
  const setLightSpy = jest.fn(),
    wrapper = shallow(
      <LightStateContainer light={MOCK_LIGHT} setLight={setLightSpy} />
    ),
    mockSpeed = 7,
    expectedArguments = {
      lightId: MOCK_LIGHT.id,
      lightData: { speed: mockSpeed }
    };

  wrapper.instance().handleSpeedChange({}, mockSpeed); // Call method
  expect(setLightSpy).toHaveBeenCalledTimes(1);
  const args = setLightSpy.mock.calls[0][0]; // Get the arguments that setLight was called with
  expect(args).toHaveProperty("variables", expectedArguments);
});

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
            light: { id: MOCK_LIGHT.id, state: "ON" }
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
            light: { id: MOCK_LIGHT.id, brightness: mockBrightness }
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
            light: { id: MOCK_LIGHT.id, color: mockColor.rgb }
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
        mockEvent = { target: { name: "effect", value: "Flash" } },
        expectedArguments = {
            light: { id: MOCK_LIGHT.id, effect: "Flash" }
        };

    wrapper.instance().handleEffectChange(mockEvent); // Call method
    expect(setLightSpy).toHaveBeenCalledTimes(1);
    const args = setLightSpy.mock.calls[0][0]; // Get the arguments that setLight was called with
    expect(args).toHaveProperty("variables", expectedArguments);
});

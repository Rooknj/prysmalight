import React from "react";
import { shallow, mount } from "enzyme";
import { MockedProvider } from "react-apollo/test-utils";
import { GET_LIGHTS } from "../graphqlConstants";
import wait from "waait";

import LightListQueryContainer, {
    Loading,
    ErrorPage
} from "./LightListQueryContainer";

import LightListSubscriptionContainer from "./LightListSubscriptionContainer";

const MOCK_LIGHT = {
    id: "LightListQueryContainerTest",
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
    shallow(<LightListQueryContainer />);
});

it("shows Loading component when loading", () => {
    const wrapper = mount(
        <MockedProvider mocks={[]} addTypename={false}>
            <LightListQueryContainer />
        </MockedProvider>
    );
    expect(wrapper.find(Loading)).toHaveLength(1);
});

it("shows ErrorPage component when it receives an error", () => {
    const mocks = [
        {
            request: {
                query: GET_LIGHTS
            },
            error: new Error("LightListQueryContainer Test Error")
        }
    ];
    const wrapper = mount(
        <MockedProvider mocks={mocks} addTypename={false}>
            <LightListQueryContainer />
        </MockedProvider>
    );

    // wait for query response
    wait(0).then(() => {
        expect(wrapper.find(ErrorPage)).toHaveLength(1);
    });
});

it("shows ErrorPage component if no lights are returned from query", () => {
    const mocks = [
        {
            request: {
                query: GET_LIGHTS
            },
            result: {
                data: {
                    lights: []
                }
            }
        }
    ];
    const wrapper = mount(
        <MockedProvider mocks={mocks} addTypename={false}>
            <LightListQueryContainer />
        </MockedProvider>
    );

    // wait for query response
    wait(0).then(() => {
        expect(wrapper.find(ErrorPage)).toHaveLength(1);
    });
});

it("shows the LightListSubscriptionContainer if there are no errors and it receives lights", () => {
    const mocks = [
        {
            request: {
                query: GET_LIGHTS
            },
            result: {
                data: {
                    lights: [MOCK_LIGHT]
                }
            }
        }
    ];
    const wrapper = mount(
        <MockedProvider mocks={mocks} addTypename={false}>
            <LightListQueryContainer />
        </MockedProvider>
    );

    // wait for query response
    wait(0).then(() => {
        // Expect the correct component
        expect(wrapper.find(LightListSubscriptionContainer)).toHaveLength(1);
        // Expect no errors
        expect(wrapper.find(ErrorPage)).toHaveLength(0);
    });
});

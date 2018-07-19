import React from "react";
import { shallow } from "enzyme";
import LightListSubscriptionContainer from "./LightListSubscriptionContainer";

it("renders without crashing", () => {
  shallow(<LightListSubscriptionContainer />);
});

it("subscribes to light changes on mount", () => {
  // Set up mocked functions
  const subscribeToLightChangesSpy = jest.fn();

  // Render the container with the mock function
  shallow(
    <LightListSubscriptionContainer
      subscribeToLightChanges={subscribeToLightChangesSpy}
    />
  );

  // Expect the subscription function to be called once
  expect(subscribeToLightChangesSpy).toHaveBeenCalledTimes(3);
});

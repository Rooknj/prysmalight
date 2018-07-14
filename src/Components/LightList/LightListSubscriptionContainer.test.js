import React from "react";
import { shallow } from "enzyme";
import LightListSubscriptionContainer from "./LightListSubscriptionContainer";

it("renders without crashing", () => {
    shallow(<LightListSubscriptionContainer />);
});

import React from "react";
import { shallow, mount } from "enzyme";
import Light from "./Light";
import { createSerializer } from "enzyme-to-json";
import { ThemeProvider } from "styled-components";

// Add serializer to allow enzyme to create snapshots
expect.addSnapshotSerializer(createSerializer({ mode: "deep" }));

const mockTheme = { spacing: { unit: 2 } };

const defaultProps = {
  onStateChange: () => true,
  onBrightnessChange: () => true,
  onColorChange: () => true,
  onEffectChange: () => true,
  onSpeedChange: () => true
};

// TODO: Test rendering with actual mock light data
it("renders without crashing", () => {
  shallow(<Light {...defaultProps} />);
});

it("matches shallow snapshot", () => {
  const shallowed = shallow(<Light {...defaultProps} />);
  expect(shallowed).toMatchSnapshot();
});

it("matches mounted snapshot", () => {
  const mounted = mount(
    <ThemeProvider theme={mockTheme}>
      <Light {...defaultProps} />
    </ThemeProvider>
  );
  expect(mounted).toMatchSnapshot();
});

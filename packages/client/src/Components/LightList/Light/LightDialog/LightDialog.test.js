import React from "react";
import { shallow, mount } from "enzyme";
import LightDialog from "./LightDialog";
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
  onSpeedChange: () => true,
  open: false
};

// TODO: Test rendering with actual mock light data
it("renders without crashing", () => {
  shallow(<LightDialog {...defaultProps} />);
});

it("matches shallow snapshot", () => {
  const shallowed = shallow(<LightDialog {...defaultProps} />);
  expect(shallowed).toMatchSnapshot();
});

it("matches mounted snapshot", () => {
  const mounted = mount(
    <ThemeProvider theme={mockTheme}>
      <LightDialog {...defaultProps} />
    </ThemeProvider>
  );
  expect(mounted).toMatchSnapshot();
});

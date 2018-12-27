import React from "react";
import { shallow, mount } from "enzyme";
import Light from "./LightDialog";
import { createSerializer } from "enzyme-to-json";
import { ThemeProvider } from "styled-components";

// Add serializer to allow enzyme to create snapshots
expect.addSnapshotSerializer(createSerializer({ mode: "deep" }));

const mockTheme = { spacing: { unit: 2 } };

// TODO: Test rendering with actual mock light data
it("renders without crashing", () => {
  shallow(
    <Light
      onStateChange={() => true}
      onBrightnessChange={() => true}
      onColorChange={() => true}
      onEffectChange={() => true}
    />
  );
});

it("matches shallow snapshot", () => {
  const shallowed = shallow(
    <Light
      onStateChange={() => true}
      onBrightnessChange={() => true}
      onColorChange={() => true}
      onEffectChange={() => true}
    />
  );
  expect(shallowed).toMatchSnapshot();
});

it("matches mounted snapshot", () => {
  const mounted = mount(
    <ThemeProvider theme={mockTheme}>
      <Light
        onStateChange={() => true}
        onBrightnessChange={() => true}
        onColorChange={() => true}
        onEffectChange={() => true}
      />
    </ThemeProvider>
  );
  expect(mounted).toMatchSnapshot();
});

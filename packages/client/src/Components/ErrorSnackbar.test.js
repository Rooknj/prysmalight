import React from "react";
import { shallow, mount } from "enzyme";
import { createSerializer } from "enzyme-to-json";
import LightSnackbar from "./LightSnackbar";
import { ThemeProvider } from "styled-components";

// Add serializer to allow enzyme to create snapshots
expect.addSnapshotSerializer(createSerializer({ mode: "deep" }));

const mockTheme = { spacing: { unit: 2 } };
const mockMessage = "Error!";
// TODO: Test rendering with actual mock lights
it("renders without crashing", () => {
  shallow(
    <ThemeProvider theme={mockTheme}>
      <LightSnackbar message={mockMessage} />
    </ThemeProvider>
  );
});

it("matches shallow snapshot", () => {
  const shallowed = shallow(
    <ThemeProvider theme={mockTheme}>
      <LightSnackbar message={mockMessage} />
    </ThemeProvider>
  );
  expect(shallowed).toMatchSnapshot();
});

it("matches mounted snapshot", () => {
  const mounted = mount(
    <ThemeProvider theme={mockTheme}>
      <LightSnackbar message={mockMessage} />
    </ThemeProvider>
  );
  expect(mounted).toMatchSnapshot();
});

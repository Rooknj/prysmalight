import React from "react";
import AppBar from "./Components/LightAppBar/LightAppBar";
import LightTool from "./Components/LightTool";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider } from "@material-ui/core/styles";
import theme from "./theme";
import { ThemeProvider } from "styled-components";
import JssProvider from "react-jss/lib/JssProvider";
import { create } from "jss";
import { createGenerateClassName, jssPreset } from "@material-ui/core/styles";

/**
 * This is here in order to put Styled Components' CSS rules above the default Material UI rules
 */
const generateClassName = createGenerateClassName();
const jss = create({
  ...jssPreset(),
  // We define a custom insertion point that JSS will look for injecting the styles in the DOM.
  insertionPoint: document.getElementById("jss-insertion-point")
});

const App = () => (
  <JssProvider jss={jss} generateClassName={generateClassName}>
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={{ ...theme }}>
        <CssBaseline>
          <AppBar />
          <LightTool />
        </CssBaseline>
      </ThemeProvider>
    </MuiThemeProvider>
  </JssProvider>
);

export default App;

/*
    React Notes!
    https://camjackson.net/post/9-things-every-reactjs-beginner-should-know#its-just-a-view-library

    1. Keep your components small
     - make your components significantly smaller than you think they need to be

    2. Write functional components
     - const MyComponent = props => ( ...code );
     vs
     - class MyComponent extends React.Component { ...code }

    3. Write stateless components
     - Components should be pure data-in data-out functions of props

    4. Always use propTypes
 */

import React from "react";
import LightTool from "./Components/LightTool";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "styled-components";
import amber from "@material-ui/core/colors/amber";
import deepPurple from "@material-ui/core/colors/deepPurple";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
import LightActions from "./Components/LightActions/LightActions";

const theme = createMuiTheme({
  palette: {
    type: "dark", // Switching the dark mode on is a single property value change.
    primary: amber,
    secondary: deepPurple
  },
  typography: {
    useNextVariants: true
  }
});

const StyledAppBar = styled(AppBar)`
  top: auto !important;
  right: auto !important;
  min-width: 21rem;
  bottom: 0;
`;

const StyledToolbar = styled(Toolbar)`
  align-items: center;
  justify-content: center;
`;

const StyledAppBody = styled.div`
  padding-bottom: 5rem;
`;

const App = () => (
  <MuiThemeProvider theme={theme}>
    <ThemeProvider theme={{ ...theme }}>
      <CssBaseline>
        <AppBar position="static" color="primary">
          <StyledToolbar>
            <Typography variant="h6" color="inherit">
              Light App 2.0
            </Typography>
          </StyledToolbar>
        </AppBar>
        <StyledAppBody>
          <LightTool />
        </StyledAppBody>
        <StyledAppBar position="fixed" color="primary">
          <StyledToolbar>
            <LightActions />
          </StyledToolbar>
        </StyledAppBar>
      </CssBaseline>
    </ThemeProvider>
  </MuiThemeProvider>
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

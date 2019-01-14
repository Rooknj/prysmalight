import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
import LightActionsContainer from "./LightActions/LightActionsContainer";

const StyledToolbar = styled(Toolbar)`
  align-items: center;
  justify-content: space-between;
`;

const LightAppBar = () => (
  <AppBar position="sticky" color="primary">
    <StyledToolbar>
      <Typography variant="h6" color="inherit">
        Prysmalight
      </Typography>
      <LightActionsContainer />
    </StyledToolbar>
  </AppBar>
);

export default LightAppBar;

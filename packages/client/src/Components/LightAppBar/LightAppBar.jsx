import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import LightActionsContainer from "./LightActions/LightActionsContainer";
import LightDrawer from "./LightDrawer";

const StyledToolbar = styled(Toolbar)`
  justify-content: space-between;
`;

const LeftDiv = styled.div`
  display: flex;
  align-items: center;
`;

const StyledMenuButton = styled(IconButton)`
  ${({ open }) => (open ? "display: none;" : "")}
  margin-left: -12px;
  margin-right: 20px;
`;

const LightAppBar = ({ open, onOpen, onClose }) => (
  <React.Fragment>
    <LightDrawer open={open} onOpen={onOpen} onClose={onClose} />
    <AppBar position="sticky" color="primary">
      <StyledToolbar>
        <LeftDiv>
          <StyledMenuButton color="inherit" aria-label="Menu" onClick={onOpen}>
            <MenuIcon />
          </StyledMenuButton>
          <Typography variant="h6" color="inherit">
            Prysmalight
          </Typography>
        </LeftDiv>
        <LightActionsContainer />
      </StyledToolbar>
    </AppBar>
  </React.Fragment>
);

export default LightAppBar;

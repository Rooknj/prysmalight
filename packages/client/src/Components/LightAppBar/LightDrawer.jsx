import React from "react";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import UpdateIcon from "@material-ui/icons/Update";
import RebootIcon from "@material-ui/icons/PowerSettingsNew";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import styled from "styled-components";

const DrawerHeader = styled.div`
  @media (min-width: 600px) {
    min-height: 64px;
  }
  min-height: 56px;
`;

const LightDrawer = ({ open, onOpen, onClose }) => (
  <SwipeableDrawer anchor="left" open={open} onOpen={onOpen} onClose={onClose}>
    <DrawerHeader />
    <Divider />
    <List>
      <ListItem button>
        <ListItemIcon>
          <UpdateIcon />
        </ListItemIcon>
        <ListItemText primary={"Update Prysmalight"} />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <RebootIcon />
        </ListItemIcon>
        <ListItemText primary={"Reboot Prysmalight Hub"} />
      </ListItem>
    </List>
  </SwipeableDrawer>
);

export default LightDrawer;

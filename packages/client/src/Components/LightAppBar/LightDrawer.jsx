import React from "react";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import UpdateIcon from "@material-ui/icons/Update";
import RebootIcon from "@material-ui/icons/PowerSettingsNew";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

const LightDrawer = ({ open, onOpen, onClose }) => (
  <SwipeableDrawer anchor="left" open={open} onOpen={onOpen} onClose={onClose}>
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

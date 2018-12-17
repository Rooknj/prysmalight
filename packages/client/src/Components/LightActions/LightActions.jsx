import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

class LightActions extends React.Component {
  state = {
    open: false
  };

  toggleDrawer = open => () => {
    this.setState({
      open
    });
  };

  render() {
    const { actions } = this.props;

    return (
      <React.Fragment>
        <IconButton color="inherit" onClick={this.toggleDrawer(true)}>
          <Icon>edit_icon</Icon>
        </IconButton>
        <Drawer
          anchor="right"
          open={this.state.open}
          onClose={this.toggleDrawer(false)}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer(false)}
            onKeyDown={this.toggleDrawer(false)}
          >
            <List>
              {actions.map(action => (
                <ListItem button key={action.name} onClick={action.handler}>
                  <ListItemIcon>{action.icon}</ListItemIcon>
                  <ListItemText primary={action.name} />
                </ListItem>
              ))}
            </List>
          </div>
        </Drawer>
      </React.Fragment>
    );
  }
}

export default LightActions;

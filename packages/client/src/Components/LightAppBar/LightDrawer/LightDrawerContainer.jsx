import React from "react";
import LightDrawer from "./LightDrawer";

class LightDrawerContainer extends React.Component {
  state = {
    updating: false,
    rebooting: false
  };

  handleUpdate = () => {
    console.log("Update")
  };

  handleReboot = () => {
    console.log("reboot");
  };

  render() {
    const { updating, rebooting } = this.state;
    return (
      <LightDrawer
        updating={updating}
        onUpdate={this.handleUpdate}
        rebooting={rebooting}
        onReboot={this.handleReboot}
        {...this.props}
      />
    );
  }
}

export default LightDrawerContainer;

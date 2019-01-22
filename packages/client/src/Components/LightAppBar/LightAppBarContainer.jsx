import React from "react";
import LightAppBar from "./LightAppBar";

class LightAppBarContainer extends React.Component {
  state = {
    open: false
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <LightAppBar
        onOpen={this.handleOpen}
        onClose={this.handleClose}
        open={this.state.open}
      />
    );
  }
}

export default LightAppBarContainer;

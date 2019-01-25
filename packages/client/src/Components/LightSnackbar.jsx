import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";

const StyledIconButton = styled(IconButton)`
  padding: ${({ theme }) => theme.spacing.unit / 4}px;
`;

const propTypes = {};
const defaultProps = {};

class LightSnackbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true
    };
  }
  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({ open: false });
  };
  render() {
    const { message, type } = this.props;
    return (
      <React.Fragment>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          open={this.state.open}
          autoHideDuration={6000}
          onClose={this.handleClose}
          ContentProps={{
            "aria-describedby": "message-id"
          }}
          message={
            <span id="message-id">
              <Typography variant="body1" color={type === "error" ? "error" : "inherit"}>
                {message}
              </Typography>
            </span>
          }
          action={[
            <StyledIconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.handleClose}
            >
              <CloseIcon />
            </StyledIconButton>
          ]}
        />
      </React.Fragment>
    );
  }
}
LightSnackbar.propTypes = propTypes;
LightSnackbar.defaultProps = defaultProps;
export default LightSnackbar;

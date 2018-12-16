import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

class LightFormDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lightId: ""
    };
  }

  static getDerivedStateFromProps(props, state) {
    // Clear the lightId if the modal is closed
    if (!props.open) {
      return { ...state, lightId: "" };
    }

    return state;
  }

  handleChange = e => {
    this.setState({
      lightId: e.target.value
    });
  };

  handleSubmit = () => {
    this.props.onSubmit(this.state.lightId);
  };

  render() {
    const {
      open,
      title,
      contentText,
      submitText,
      onClose,
      loading
    } = this.props;
    return (
      <Dialog open={open} onClose={onClose} aria-labelledby={title}>
        <DialogTitle id={title}>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{contentText}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="lightName"
            label="Light Name"
            type="text"
            fullWidth
            value={this.state.lightId}
            onChange={this.handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={this.handleSubmit}
            color="primary"
            disabled={loading}
          >
            {submitText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

LightFormDialog.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  contentText: PropTypes.string,
  submitText: PropTypes.string,
  onClose: PropTypes.func,
  loading: PropTypes.bool
};

LightFormDialog.defaultProps = {
  submitText: "Submit"
};

export default LightFormDialog;

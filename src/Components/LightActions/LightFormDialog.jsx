import React from "react";
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
            loading,
            error,
            success
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

LightFormDialog.propTypes = {};

LightFormDialog.defaultProps = {
    submitText: "Submit"
};

export default LightFormDialog;

import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const LightFormDialog = ({
    open,
    title,
    contentText,
    submitText,
    onCancel,
    onSubmit
}) => {
    return (
        <Dialog open={open} onClose={onCancel} aria-labelledby={title}>
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
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="primary">
                    Cancel
                </Button>
                <Button onClick={onSubmit} color="primary">
                    {submitText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

LightFormDialog.propTypes = {};

LightFormDialog.defaultProps = {
    submitText: "Submit"
};

export default LightFormDialog;

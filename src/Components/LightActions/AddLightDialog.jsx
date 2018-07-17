import React from "react";
import PropTypes from "prop-types";

import LightFormDialog from "./LightFormDialog";

const AddLightDialog = ({ open, onClose, onAddLight }) => {
    return (
        <LightFormDialog
            open={open}
            title="Add Light"
            contentText="Enter the name of the light you want to add"
            submitText="Add Light"
            onCancel={onClose}
            onSubmit={onAddLight}
        />
    );
};

export default AddLightDialog;

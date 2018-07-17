import React from "react";
import PropTypes from "prop-types";

import LightFormDialog from "./LightFormDialog";

const RemoveLightDialog = ({ open, onClose, onRemoveLight }) => {
    return (
        <LightFormDialog
            open={open}
            title="Remove Light"
            contentText="Enter the name of the light you want to remove"
            submitText="Remove Light"
            onCancel={onClose}
            onSubmit={onRemoveLight}
        />
    );
};

export default RemoveLightDialog;

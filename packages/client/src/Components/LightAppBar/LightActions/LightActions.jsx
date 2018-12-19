import React from "react";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

const LightActions = ({ onAddLight, onRemoveLight }) => (
  <React.Fragment>
    <IconButton color="inherit" onClick={onAddLight}>
      <AddIcon />
    </IconButton>
    <IconButton color="inherit" onClick={onRemoveLight}>
      <DeleteIcon />
    </IconButton>
    <IconButton color="inherit" onClick={() => console.log("HAHAHA EDIT")}>
      <EditIcon />
    </IconButton>
  </React.Fragment>
);

export default LightActions;

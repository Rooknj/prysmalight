import React from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import LightSpeedDial from "./LightSpeedDial";
import AddLightDialog from "./AddLightDialog";
import RemoveLightDialog from "./RemoveLightDialog";

class LightActions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAddLight: false,
            showRemoveLight: false,
            actions: [
                {
                    name: "Add Light",
                    icon: <AddIcon />,
                    handler: this.handleShowAddLight
                },
                {
                    name: "Remove Light",
                    icon: <DeleteIcon />,
                    handler: this.handleShowRemoveLight
                }
            ]
        };
    }

    handleShowAddLight = () => {
        this.setState({
            showAddLight: true,
            open: false
        });
    };

    handleShowRemoveLight = () => {
        this.setState({
            showRemoveLight: true,
            open: false
        });
    };

    handleCloseAddLight = () => {
        this.setState({
            showAddLight: false,
            open: false
        });
    };

    handleCloseRemoveLight = () => {
        this.setState({
            showRemoveLight: false,
            open: false
        });
    };

    handleAddLight = () => {
        console.log("Add Light");
    };

    handleRemoveLight = () => {
        console.log("Remove Light");
    };

    render() {
        const { showAddLight, showRemoveLight, actions } = this.state;

        return (
            <React.Fragment>
                <LightSpeedDial actions={actions} />
                <AddLightDialog
                    open={showAddLight}
                    onClose={this.handleCloseAddLight}
                    onAddLight={this.handleAddLight}
                />
                <RemoveLightDialog
                    open={showRemoveLight}
                    onClose={this.handleCloseRemoveLight}
                    onRemoveLight={this.handleRemoveLight}
                />
            </React.Fragment>
        );
    }
}

LightActions.propTypes = {};

export default LightActions;

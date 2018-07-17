import React from "react";
import PropTypes from "prop-types";

import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleIcon from "@material-ui/icons/Add";
import LightFormDialog from "./LightFormDialog";

import styled from "styled-components";

const StyledSpeedDial = styled(SpeedDial)`
    position: fixed;
    bottom: ${({ theme }) => theme.spacing.unit * 2}px;
    right: ${({ theme }) => theme.spacing.unit * 3}px;
`;

class LightActions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            showAddLight: false,
            showRemoveLight: false
        };
    }

    handleClick = () => {
        console.log(this.state.open);
        this.setState({
            open: !this.state.open
        });
    };

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
        console.log("Remove Light");
        this.handleCloseAddLight();
    };

    handleRemoveLight = () => {
        console.log("Add Light");
        this.handleCloseRemoveLight();
    };

    handleOpen = () => {
        this.setState({
            open: true
        });
    };

    handleClose = () => {
        this.setState({
            open: false
        });
    };

    render() {
        const { open, showAddLight, showRemoveLight } = this.state;

        let isTouch;
        if (typeof document !== "undefined") {
            isTouch = "ontouchstart" in document.documentElement;
        }

        return (
            <React.Fragment>
                <StyledSpeedDial
                    ariaLabel="Light Actions"
                    icon={<SpeedDialIcon />}
                    onBlur={this.handleClose}
                    onClick={this.handleClick}
                    onClose={this.handleClose}
                    onFocus={isTouch ? undefined : this.handleOpen}
                    ButtonProps={{
                        onMouseEnter: isTouch ? undefined : this.handleOpen
                    }}
                    onMouseLeave={this.handleClose}
                    open={open}
                >
                    <SpeedDialAction
                        key={"Add Light"}
                        icon={<AddCircleIcon />}
                        tooltipTitle={"Add Light"}
                        onClick={this.handleShowAddLight}
                    />
                    <SpeedDialAction
                        key={"Delete Light"}
                        icon={<DeleteIcon />}
                        tooltipTitle={"Delete Light"}
                        onClick={this.handleShowRemoveLight}
                    />
                </StyledSpeedDial>
                <LightFormDialog
                    open={showAddLight}
                    title="Add Light"
                    contentText="Enter the name of the light you want to add"
                    submitText="Add Light"
                    onCancel={this.handleCloseAddLight}
                    onSubmit={this.handleAddLight}
                />
                <LightFormDialog
                    open={showRemoveLight}
                    title="Remove Light"
                    contentText="Enter the name of the light you want to remove"
                    submitText="Remove Light"
                    onCancel={this.handleCloseRemoveLight}
                    onSubmit={this.handleRemoveLight}
                />
            </React.Fragment>
        );
    }
}

LightActions.propTypes = {};

export default LightActions;

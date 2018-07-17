import React from "react";
import PropTypes from "prop-types";

import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleIcon from "@material-ui/icons/Add";

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
            open: false
        };
    }

    handleClick = () => {
        this.setState({
            open: !this.state.open
        });
    };

    handleAddLight = () => {
        console.log("Add Light");
        this.handleClick();
    };

    handleDeleteLight = () => {
        console.log("Delete Light");
        this.handleClick();
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
        const { open } = this.state;

        let isTouch;
        if (typeof document !== "undefined") {
            isTouch = "ontouchstart" in document.documentElement;
        }

        return (
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
                    onClick={this.handleAddLight}
                />
                <SpeedDialAction
                    key={"Delete Light"}
                    icon={<DeleteIcon />}
                    tooltipTitle={"Delete Light"}
                    onClick={this.handleDeleteLight}
                />
            </StyledSpeedDial>
        );
    }
}

LightActions.propTypes = {};

export default LightActions;

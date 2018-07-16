import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import { MaterialPicker, CirclePicker, HuePicker } from "react-color";
import Typography from "@material-ui/core/Typography";
import styled from "styled-components";

const StyledCirclePicker = styled(CirclePicker)`
    justify-content: flex-start;
    width: 100% !important;
    height: 100% !important;
    align-items: center;
    margin-top: 0.2em;
    margin-left: 0.5em;
    display: flex;
    justify-content: flex-start;
`;

const StyledMaterialPicker = styled(MaterialPicker)`
    box-sizing: content-box;
`;

const StyledMaterialPickerGrid = styled(Grid)`
    display: flex;
    justify-content: flex-end;
`;

const StyledMaterialPickerWrapper = styled.div`
    margin-top: 0.5em;
    margin-right: 0.5em;
    margin-bottom: 0.5em;
`;

const StyledHuePicker = styled(HuePicker)`
    width: 100%;
    touch-action: none;
`;

const propTypes = {
    color: PropTypes.object,
    colors: PropTypes.array,
    onColorChange: PropTypes.func
};

const defaultProps = {
    colors: [
        "#000000", //red
        "#FFA500", //orange
        "#FFFF00", //yellow
        "#00FF00", //green
        "#00FFFF", //cyan
        "#0000FF", //blue
        "#A500FF", //purple
        "#FF00FF" //pink
    ],
    onColorChange: () => {},
    color: {
        r: 0,
        g: 0,
        b: 0
    }
};

const ColorSection = props => {
    return (
        <Grid
            container
            direction="row"
            spacing={16}
            justify="center"
            alignItems="center"
        >
            <Grid item xs={12}>
                <Typography variant="body2">Color</Typography>
            </Grid>
            <Grid item xs={12}>
                <StyledHuePicker
                    color={props.color}
                    onChange={props.onColorChange}
                />
            </Grid>
            <Grid container>
                <Grid item xs={6}>
                    <StyledCirclePicker
                        color={props.color}
                        onChange={props.onColorChange}
                        colors={props.colors}
                    />
                </Grid>
                <StyledMaterialPickerGrid item xs={6}>
                    <StyledMaterialPickerWrapper>
                        <StyledMaterialPicker
                            color={props.color}
                            onChange={props.onColorChange}
                        />
                    </StyledMaterialPickerWrapper>
                </StyledMaterialPickerGrid>
            </Grid>
        </Grid>
    );
};

ColorSection.propTypes = propTypes;
ColorSection.defaultProps = defaultProps;

export default ColorSection;

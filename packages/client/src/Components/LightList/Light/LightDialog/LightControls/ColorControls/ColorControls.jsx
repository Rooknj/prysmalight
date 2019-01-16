import React from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";

const PickerDiv = styled.div`
  margin: 0 auto 0 auto;
`;

const TextDiv = styled.div`
  margin-bottom: 1em;
`;

const propTypes = {
  color: PropTypes.shape({
    r: PropTypes.number.isRequired,
    g: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired
  }),
  onColorChange: PropTypes.func.isRequired
};

const defaultProps = {
  color: {
    r: 0,
    g: 0,
    b: 0
  }
};

const ColorControls = props => (
  <React.Fragment>
    <TextDiv>
      <Typography variant="h6" align="center">
        Move Circle to Pick a Color
      </Typography>
    </TextDiv>
    <PickerDiv>
      <ColorPicker
        color={props.color}
        onChange={props.onColorChange}
        height={320}
        width={320}
      />
    </PickerDiv>
  </React.Fragment>
);
ColorControls.propTypes = propTypes;
ColorControls.defaultProps = defaultProps;

export default ColorControls;

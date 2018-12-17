import React from "react";
import Icon from "@material-ui/core/Icon";
import Fab from "@material-ui/core/Fab";
import styled from "styled-components";

const StyledFabButton = styled(Fab)`
  position: absolute;
  zindex: 1px;
  top: -30px;
  left: 0px;
  right: 0px;
  margin: 0px auto;
`;

class LightActions extends React.Component {
  render() {
    return (
      <React.Fragment>
        <StyledFabButton color="secondary" aria-label="Add">
          <Icon>edit_icon</Icon>
        </StyledFabButton>
      </React.Fragment>
    );
  }
}

export default LightActions;

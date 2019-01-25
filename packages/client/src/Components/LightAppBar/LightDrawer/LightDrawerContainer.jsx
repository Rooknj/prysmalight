import React from "react";
import LightDrawer from "./LightDrawer";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import LightSnackbar from "../../LightSnackbar";

const UPDATE_HUB = gql`
  mutation updateHub {
    updateHub
  }
`;

const REBOOT_HUB = gql`
  mutation rebootHub {
    rebootHub
  }
`;

class LightDrawerContainer extends React.Component {
  render() {
    return (
      <Mutation mutation={UPDATE_HUB}>
        {(updateHub, update) => (
          <Mutation mutation={REBOOT_HUB}>
            {(rebootHub, reboot) => (
              <React.Fragment>
                <LightDrawer
                  updating={update.loading}
                  onUpdate={updateHub}
                  rebooting={reboot.loading}
                  onReboot={rebootHub}
                  {...this.props}
                />
                {update.error && (
                  <LightSnackbar
                    message={`Error Updating Prysmalight Hub`}
                    type="error"
                  />
                )}
                {reboot.error && (
                  <LightSnackbar
                    message={`Error Rebooting Prysmalight Hub`}
                    type="error"
                  />
                )}
                {update.data && (
                  <LightSnackbar
                    message={`Prysmalight Updated Successfully`}
                  />
                )}
                {reboot.data && (
                  <LightSnackbar
                    message={`Reboot Initiated`}
                  />
                )}
              </React.Fragment>
            )}
          </Mutation>
        )}
      </Mutation>
    );
  }
}

export default LightDrawerContainer;

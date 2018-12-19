import React from "react";
import LightActions from "./LightActions";
import LightFormDialog from "./LightFormDialog";
import { Mutation } from "react-apollo";
import { ADD_LIGHT, REMOVE_LIGHT, GET_LIGHTS } from "../../graphqlConstants";

const addLightToCache = (cache, { data: { addLight } }) => {
  // If no data was returned, do nothing
  if (!addLight) return;
  const { lights } = cache.readQuery({
    query: GET_LIGHTS
  });

  // If the light already exists, do nothing
  if (lights.find(light => light.id === addLight.id)) return;

  // Write the light to the cache
  cache.writeQuery({
    query: GET_LIGHTS,
    data: { lights: lights.concat([addLight]) }
  });
};

const removeLightFromCache = (cache, { data: { removeLight } }) => {
  // If no data was returned, do nothing
  if (!removeLight) return;
  const { lights } = cache.readQuery({
    query: GET_LIGHTS
  });

  // Find the index of the light to be removed
  var index = lights.indexOf(lights.find(light => light.id === removeLight.id));

  // Remove the light
  if (index > -1) {
    lights.splice(index, 1);
  }
  cache.writeQuery({
    query: GET_LIGHTS,
    data: { lights }
  });
};

class LightActionsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddLight: false,
      showRemoveLight: false
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

  handleMutationError = error => {
    console.error(error);
  };

  handleMutationComplete = data => {
    if (data.addLight) {
      this.setState({ showAddLight: false });
    } else if (data.removeLight) {
      this.setState({ showRemoveLight: false });
    }
  };

  render() {
    const { showAddLight, showRemoveLight } = this.state;

    return (
      <div>
        <LightActions
          onAddLight={this.handleShowAddLight}
          onRemoveLight={this.handleShowRemoveLight}
        />
        <Mutation
          mutation={ADD_LIGHT}
          update={addLightToCache}
          onCompleted={this.handleMutationComplete}
          onError={this.handleMutationError}
        >
          {(addLight, { data, loading, error }) => (
            <LightFormDialog
              title="Add Light"
              contentText="Enter the name of the light you want to add"
              submitText="Add Light"
              open={showAddLight}
              loading={loading}
              success={data}
              error={error}
              onClose={this.handleCloseAddLight}
              onSubmit={lightId => {
                addLight({
                  variables: {
                    lightId: lightId
                  }
                });
              }}
            />
          )}
        </Mutation>
        <Mutation
          mutation={REMOVE_LIGHT}
          update={removeLightFromCache}
          onCompleted={this.handleMutationComplete}
          onError={this.handleMutationError}
        >
          {(removeLight, { data, loading, error }) => (
            <LightFormDialog
              title="Remove Light"
              contentText="Enter the name of the light you want to remove"
              submitText="Remove Light"
              open={showRemoveLight}
              loading={loading}
              success={data}
              error={error}
              onClose={this.handleCloseRemoveLight}
              onSubmit={lightId => {
                removeLight({
                  variables: {
                    lightId: lightId
                  }
                });
              }}
            />
          )}
        </Mutation>
      </div>
    );
  }
}

LightActionsContainer.propTypes = {};

export default LightActionsContainer;

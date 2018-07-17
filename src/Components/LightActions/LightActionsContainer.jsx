import React from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import LightSpeedDial from "./LightSpeedDial";
import LightFormDialog from "./LightFormDialog";
import { Mutation } from "react-apollo";
import { ADD_LIGHT, REMOVE_LIGHT, GET_LIGHTS } from "../graphqlConstants";

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

    handleMutationError = () => {
        console.log("Error");
    };

    render() {
        const { showAddLight, showRemoveLight, actions } = this.state;

        return (
            <React.Fragment>
                <LightSpeedDial actions={actions} />
                <Mutation
                    mutation={ADD_LIGHT}
                    update={(cache, { data: { addLight } }) => {
                        if (!addLight) return;
                        const { lights } = cache.readQuery({
                            query: GET_LIGHTS
                        });
                        cache.writeQuery({
                            query: GET_LIGHTS,
                            data: { lights: lights.concat([addLight]) }
                        });
                    }}
                >
                    {(addLight, { data, loading, error }) => {
                        if (error) {
                            this.handleMutationError(error);
                        }
                        return (
                            <LightFormDialog
                                title="Add Light"
                                contentText="Enter the name of the light you want to add"
                                submitText="Add Light"
                                open={showAddLight}
                                loading={loading}
                                onClose={this.handleCloseAddLight}
                                onSubmit={lightId => {
                                    addLight({
                                        variables: {
                                            lightId: lightId
                                        }
                                    });
                                }}
                            />
                        );
                    }}
                </Mutation>
                <Mutation
                    mutation={REMOVE_LIGHT}
                    update={(cache, { data: { removeLight } }) => {
                        if (!removeLight) return;
                        const { lights } = cache.readQuery({
                            query: GET_LIGHTS
                        });
                        var index = lights.indexOf(
                            lights.find(light => light.id === removeLight.id)
                        );
                        if (index > -1) {
                            lights.splice(index, 1);
                        }
                        cache.writeQuery({
                            query: GET_LIGHTS,
                            data: { lights }
                        });
                    }}
                >
                    {(removeLight, { data, loading, error }) => {
                        if (error) {
                            this.handleMutationError(error);
                        }
                        return (
                            <LightFormDialog
                                title="Remove Light"
                                contentText="Enter the name of the light you want to remove"
                                submitText="Remove Light"
                                open={showRemoveLight}
                                loading={loading}
                                onClose={this.handleCloseRemoveLight}
                                onSubmit={lightId => {
                                    removeLight({
                                        variables: {
                                            lightId: lightId
                                        }
                                    });
                                }}
                            />
                        );
                    }}
                </Mutation>
            </React.Fragment>
        );
    }
}

LightActions.propTypes = {};

export default LightActions;

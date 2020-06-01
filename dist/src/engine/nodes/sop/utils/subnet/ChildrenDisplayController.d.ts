import { SubnetSopNode } from '../../Subnet';
import { DisplayNodeControllerCallbacks } from '../../../utils/DisplayNodeController';
import { SubnetOutputSopNode } from '../../SubnetOutput';
export declare class SopSubnetChildrenDisplayController {
    private node;
    private _output_node_needs_update;
    private _output_node;
    private _graph_node;
    constructor(node: SubnetSopNode);
    display_node_controller_callbacks(): DisplayNodeControllerCallbacks;
    output_node(): SubnetOutputSopNode | undefined;
    initialize_node(): void;
    private _update_output_node;
    private _on_create_bound;
    private _on_create;
    private _create_graph_node;
}

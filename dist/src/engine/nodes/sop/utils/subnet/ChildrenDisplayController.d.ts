import { DisplayNodeControllerCallbacks, DisplayNodeController } from '../../../utils/DisplayNodeController';
import { SubnetOutputSopNode } from '../../SubnetOutput';
import { TypedSopNode, BaseSopNodeType } from '../../_Base';
import { NodeContext } from '../../../../poly/NodeContext';
import { GeoNodeChildrenMap } from '../../../../poly/registers/nodes/Sop';
import { NodeParamsConfig } from '../../../utils/params/ParamsConfig';
import { CoreGroup } from '../../../../../core/geometry/Group';
import { ParamsInitData } from '../../../utils/io/IOController';
export declare class SubnetSopNodeLike<T extends NodeParamsConfig> extends TypedSopNode<T> {
    initialize_base_node(): void;
    readonly children_display_controller: SopSubnetChildrenDisplayController;
    readonly display_node_controller: DisplayNodeController;
    protected _children_controller_context: NodeContext;
    createNode<S extends keyof GeoNodeChildrenMap>(node_class: S, params_init_value_overrides?: ParamsInitData): GeoNodeChildrenMap[S];
    createNode<K extends valueof<GeoNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BaseSopNodeType[];
    nodes_by_type<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][];
    cook(input_contents: CoreGroup[]): Promise<void>;
}
export declare class SopSubnetChildrenDisplayController {
    private node;
    private _output_node_needs_update;
    private _output_node;
    private _graph_node;
    constructor(node: SubnetSopNodeLike<any>);
    display_node_controller_callbacks(): DisplayNodeControllerCallbacks;
    output_node(): SubnetOutputSopNode | undefined;
    initialize_node(): void;
    private _update_output_node;
    private _create_graph_node;
}

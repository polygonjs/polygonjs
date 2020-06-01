import { TypedSopNode, BaseSopNodeType } from './_Base';
import { GeoNodeChildrenMap } from '../../poly/registers/nodes/Sop';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { SopSubnetChildrenDisplayController } from './utils/subnet/ChildrenDisplayController';
import { DisplayNodeController } from '../utils/DisplayNodeController';
declare class SubnetSopParamsConfig extends NodeParamsConfig {
}
export declare class SubnetSopNode extends TypedSopNode<SubnetSopParamsConfig> {
    params_config: SubnetSopParamsConfig;
    static type(): string;
    readonly children_display_controller: SopSubnetChildrenDisplayController;
    readonly display_node_controller: DisplayNodeController;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    create_node<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K];
    children(): BaseSopNodeType[];
    nodes_by_type<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][];
    cook(input_contents: CoreGroup[]): Promise<void>;
}
export {};

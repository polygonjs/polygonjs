import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { NetworkChildNodeType } from '../../poly/NodeContext';
declare class SubnetOutputSopParamsConfig extends NodeParamsConfig {
}
export declare class SubnetOutputSopNode extends TypedSopNode<SubnetOutputSopParamsConfig> {
    params_config: SubnetOutputSopParamsConfig;
    static type(): Readonly<NetworkChildNodeType.OUTPUT>;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
}
export {};

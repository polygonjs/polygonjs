import { SubnetSopNodeLike } from './utils/subnet/ChildrenDisplayController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SubnetSopParamsConfig extends NodeParamsConfig {
}
export declare class SubnetSopNode extends SubnetSopNodeLike<SubnetSopParamsConfig> {
    params_config: SubnetSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _on_create_bound;
    private _on_create;
}
export {};

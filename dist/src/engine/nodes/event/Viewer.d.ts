import { TypedEventNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class ViewerParamsConfig extends NodeParamsConfig {
    class_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class ViewerEventNode extends TypedEventNode<ViewerParamsConfig> {
    params_config: ViewerParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _process_trigger_set;
    private _process_trigger_unset;
}
export {};

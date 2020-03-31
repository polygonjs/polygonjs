import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { BaseParamType } from '../../params/_Base';
import { CoreGroup } from '../../../core/geometry/Group';
declare class CacheSopParamsConfig extends NodeParamsConfig {
    cache: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    reset: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class CacheSopNode extends TypedSopNode<CacheSopParamsConfig> {
    params_config: CacheSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    static PARAM_CALLBACK_reset(node: CacheSopNode, param: BaseParamType): void;
    param_callback_PARAM_CALLBACK_reset(): Promise<void>;
}
export {};

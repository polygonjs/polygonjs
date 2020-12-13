import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
declare class FileSopParamsConfig extends NodeParamsConfig {
    url: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    reload: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class FileSopNode extends TypedSopNode<FileSopParamsConfig> {
    params_config: FileSopParamsConfig;
    static type(): string;
    required_modules(): Promise<void | import("../../poly/registers/modules/_BaseRegister").ModuleName[]>;
    initialize_node(): void;
    private _operation;
    cook(input_contents: CoreGroup[]): Promise<void>;
    static PARAM_CALLBACK_reload(node: FileSopNode): void;
    private param_callback_reload;
}
export {};

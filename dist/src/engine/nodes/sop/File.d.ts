import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class FileSopParamsConfig extends NodeParamsConfig {
    url: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    reload: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class FileSopNode extends TypedSopNode<FileSopParamsConfig> {
    params_config: FileSopParamsConfig;
    static type(): string;
    cook(): void;
    private _on_load;
    private _on_error;
    private _ensure_geometry_has_index;
    static PARAM_CALLBACK_reload(node: FileSopNode): void;
    private param_callback_reload;
}
export {};

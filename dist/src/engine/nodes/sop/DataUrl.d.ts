import { Object3D } from 'three/src/core/Object3D';
import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { BaseParamType } from '../../params/_Base';
declare class DataUrlSopParamsConfig extends NodeParamsConfig {
    url: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    json_data_keys_prefix: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    skip_entries: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    convert: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    convert_to_numeric: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    reload: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class DataUrlSopNode extends TypedSopNode<DataUrlSopParamsConfig> {
    params_config: DataUrlSopParamsConfig;
    static type(): string;
    cook(): Promise<void>;
    _on_load(objects: Object3D): void;
    _on_error(error: ErrorEvent): void;
    static PARAM_CALLBACK_reload(node: DataUrlSopNode, param: BaseParamType): void;
    param_callback_reload(): void;
}
export {};

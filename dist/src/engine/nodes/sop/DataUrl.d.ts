import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { BaseParamType } from '../../params/_Base';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
export declare enum DataType {
    JSON = "json",
    CSV = "csv"
}
export declare const DATA_TYPES: DataType[];
declare class DataUrlSopParamsConfig extends NodeParamsConfig {
    data_type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    url: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    json_data_keys_prefix: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    skip_entries: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    convert: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    convert_to_numeric: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    read_attrib_names_from_file: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    attrib_names: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    reload: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class DataUrlSopNode extends TypedSopNode<DataUrlSopParamsConfig> {
    params_config: DataUrlSopParamsConfig;
    static type(): string;
    cook(): Promise<void>;
    private _load_json;
    _on_load(geometry: BufferGeometry): void;
    _on_error(error: ErrorEvent): void;
    _load_csv(): Promise<void>;
    static PARAM_CALLBACK_reload(node: DataUrlSopNode, param: BaseParamType): void;
    param_callback_reload(): void;
}
export {};

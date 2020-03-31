import { BaseParamType } from '../_Base';
import { ParamValueSerializedTypeMap } from '../types/ParamValueSerializedTypeMap';
import { ParamType } from '../../poly/ParamType';
import { ParamInitValueSerializedTypeMap } from '../types/ParamInitValueSerializedTypeMap';
export interface ParamSerializerData {
    name: string;
    type: string;
    raw_input: ParamInitValueSerializedTypeMap[ParamType];
    value: ParamValueSerializedTypeMap[ParamType];
    expression?: string;
    graph_node_id: string;
    error_message?: string;
    is_visible: boolean;
    folder_name?: string;
    components?: string[];
}
export declare class ParamSerializer {
    protected param: BaseParamType;
    constructor(param: BaseParamType);
    to_json(): ParamSerializerData;
    raw_input(): string | number | boolean | StringOrNumber3 | import("../ramp/RampValue").RampValueJson | StringOrNumber2 | StringOrNumber4 | null;
    value(): string | number | boolean | Number2 | import("../ramp/RampValue").RampValueJson | Number3 | Number4 | null;
    expression(): string | undefined;
    error_message(): string | undefined;
    is_visible(): boolean;
}

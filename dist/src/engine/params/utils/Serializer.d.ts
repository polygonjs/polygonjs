import { CoreGraphNodeId } from '../../../core/graph/CoreGraph';
import { BaseParamType } from '../_Base';
import { ParamValueSerializedTypeMap, ParamValuePreConversionSerializedTypeMap } from '../types/ParamValueSerializedTypeMap';
import { ParamType } from '../../poly/ParamType';
import { ParamInitValueSerializedTypeMap } from '../types/ParamInitValueSerializedTypeMap';
export interface ParamSerializerData {
    name: string;
    type: ParamType;
    raw_input: ParamInitValueSerializedTypeMap[ParamType];
    value: ParamValueSerializedTypeMap[ParamType];
    value_pre_conversion: ParamValuePreConversionSerializedTypeMap[ParamType];
    expression?: string;
    graph_node_id: CoreGraphNodeId;
    error_message?: string;
    is_visible: boolean;
    folder_name?: string;
    components?: CoreGraphNodeId[];
}
export declare class ParamSerializer {
    protected param: BaseParamType;
    constructor(param: BaseParamType);
    to_json(): ParamSerializerData;
    raw_input(): any;
    value(): any;
    value_pre_conversion(): any;
    expression(): string | undefined;
    error_message(): string | undefined;
    is_visible(): boolean;
}

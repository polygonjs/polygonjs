import { TypedNode } from '../../../nodes/_Base';
import { NodeContext } from '../../../poly/NodeContext';
import { ParamJsonExporterData } from './Param';
import { ParamType } from '../../../poly/ParamType';
import { BaseConnectionPointData } from '../../../nodes/utils/io/connections/_Base';
interface NamedInputData {
    index: number;
    node: string;
    output: string;
}
declare type IndexedInputData = string | null;
export declare type InputData = NamedInputData | IndexedInputData;
interface FlagsData {
    bypass?: boolean;
    display?: boolean;
}
export interface IoConnectionPointsData {
    in?: BaseConnectionPointData[];
    out?: BaseConnectionPointData[];
}
export interface NodeJsonExporterData {
    type: string;
    nodes: Dictionary<NodeJsonExporterData>;
    children_context: NodeContext;
    params?: Dictionary<ParamJsonExporterData<ParamType>>;
    inputs?: InputData[];
    connection_points?: IoConnectionPointsData;
    selection?: string[];
    flags?: FlagsData;
    cloned_state_overriden: boolean;
    persisted_config?: object;
}
export interface NodeJsonExporterUIData {
    pos?: Number2;
    comment?: string;
    nodes: Dictionary<NodeJsonExporterUIData>;
}
declare type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;
export declare class NodeJsonExporter<T extends BaseNodeTypeWithIO> {
    protected _node: T;
    private _data;
    constructor(_node: T);
    data(): NodeJsonExporterData;
    ui_data(): NodeJsonExporterUIData;
    private is_root;
    protected inputs_data(): InputData[];
    protected connection_points_data(): IoConnectionPointsData | undefined;
    protected params_data(): Dictionary<string | number | boolean | StringOrNumber3 | import("../../../params/ramp/RampValue").RampValueJson | StringOrNumber2 | StringOrNumber4 | import("./Param").ComplexParamJsonExporterData<ParamType> | null>;
    protected nodes_data(): Dictionary<NodeJsonExporterData>;
    protected add_custom(): void;
}
export {};

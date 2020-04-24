import { BaseNodeType } from '../../../nodes/_Base';
import { NodeContext } from '../../../poly/NodeContext';
import { ParamJsonExporterData } from './Param';
import { ParamType } from '../../../poly/ParamType';
interface NamedInputData {
    name: string;
    node: string;
    output: string;
}
declare type IndexedInputData = string | null;
export declare type InputData = NamedInputData | IndexedInputData;
interface FlagsData {
    bypass?: boolean;
    display?: boolean;
}
export interface NodeJsonExporterData {
    type: string;
    nodes: Dictionary<NodeJsonExporterData>;
    children_context: NodeContext;
    params?: Dictionary<ParamJsonExporterData<ParamType>>;
    inputs?: InputData[];
    selection?: string[];
    flags?: FlagsData;
    override_clonable_state: boolean;
}
export interface NodeJsonExporterUIData {
    pos?: Number2;
    comment?: string;
    nodes: Dictionary<NodeJsonExporterUIData>;
}
export declare class NodeJsonExporter<T extends BaseNodeType> {
    protected _node: T;
    private _data;
    constructor(_node: T);
    data(): NodeJsonExporterData;
    ui_data(): NodeJsonExporterUIData;
    private is_root;
    protected inputs_data(): InputData[];
    protected params_data(): Dictionary<ParamJsonExporterData<ParamType>>;
    protected nodes_data(): Dictionary<NodeJsonExporterData>;
    protected add_custom(): void;
}
export {};

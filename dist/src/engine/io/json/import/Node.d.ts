import { BaseNodeType } from '../../../nodes/_Base';
import { NodeJsonExporterData, NodeJsonExporterUIData, InputData } from '../export/Node';
import { ParamJsonExporterData } from '../export/Param';
import { ParamType } from '../../../poly/ParamType';
export declare class NodeJsonImporter<T extends BaseNodeType> {
    protected _node: T;
    constructor(_node: T);
    process_data(data: NodeJsonExporterData): void;
    process_inputs_data(data: NodeJsonExporterData): void;
    process_ui_data(data: NodeJsonExporterUIData): void;
    create_nodes(data?: Dictionary<NodeJsonExporterData>): void;
    set_selection(data?: string[]): void;
    set_flags(data: NodeJsonExporterData): void;
    set_inputs(inputs_data?: InputData[]): void;
    process_nodes_ui_data(data: Dictionary<NodeJsonExporterUIData>): void;
    set_params(data?: Dictionary<ParamJsonExporterData<ParamType>>): void;
    private _process_param_data_simple;
    private _process_param_data_complex;
    private _is_param_data_complex;
    from_data_custom(data: NodeJsonExporterData): void;
}

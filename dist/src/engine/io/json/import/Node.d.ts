import { TypedNode } from '../../../nodes/_Base';
import { ParamType } from '../../../poly/ParamType';
import { SceneJsonImporter } from '../../../io/json/import/Scene';
import { NodeContext } from '../../../poly/NodeContext';
import { NodeJsonExporterData, NodeJsonExporterUIData, InputData, IoConnectionPointsData } from '../export/Node';
import { ParamJsonExporterData } from '../../../nodes/utils/io/IOController';
declare type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;
export declare class NodeJsonImporter<T extends BaseNodeTypeWithIO> {
    protected _node: T;
    constructor(_node: T);
    process_data(scene_importer: SceneJsonImporter, data: NodeJsonExporterData): void;
    process_inputs_data(data: NodeJsonExporterData): void;
    process_ui_data(scene_importer: SceneJsonImporter, data: NodeJsonExporterUIData): void;
    create_nodes(scene_importer: SceneJsonImporter, data?: Dictionary<NodeJsonExporterData>): void;
    set_selection(data?: string[]): void;
    set_flags(data: NodeJsonExporterData): void;
    set_connection_points(connection_points_data: IoConnectionPointsData | undefined): void;
    set_inputs(inputs_data?: InputData[]): void;
    process_nodes_ui_data(scene_importer: SceneJsonImporter, data: Dictionary<NodeJsonExporterUIData>): void;
    set_params(data?: Dictionary<ParamJsonExporterData<ParamType>>): void;
    private _process_param_data_simple;
    private _process_param_data_complex;
    private _is_param_data_complex;
    set_persisted_config(persisted_config_data: object): void;
    from_data_custom(data: NodeJsonExporterData): void;
}
export {};

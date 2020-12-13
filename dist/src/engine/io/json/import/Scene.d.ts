import { PolyScene } from '../../../scene/PolyScene';
import { SceneJsonExporterData } from '../export/Scene';
import { ImportReport } from './ImportReport';
import { OperationsComposerSopNode } from '../../../nodes/sop/OperationsComposer';
export declare class SceneJsonImporter {
    private _data;
    readonly report: ImportReport;
    private _base_operations_composer_nodes_with_resolve_required;
    constructor(_data: SceneJsonExporterData);
    static load_data(data: SceneJsonExporterData): Promise<PolyScene>;
    scene(): Promise<PolyScene>;
    add_operations_composer_node_with_path_param_resolve_required(operations_composer_node: OperationsComposerSopNode): void;
    private _resolve_operation_containers_with_path_param_resolve;
}

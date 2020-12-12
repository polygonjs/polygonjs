import { NodeJsonExporterData, NodeJsonExporterUIData } from '../../json/export/Node';
import { SceneJsonExporterData, SceneJsonExporterDataProperties } from '../../json/export/Scene';
export interface ManifestContent {
    timestamp: string;
    nodes: string[];
}
interface ImportData {
    url_prefix: string;
    manifest: ManifestContent;
    editor_mode?: boolean;
}
export interface SceneDataElements {
    root: NodeJsonExporterData;
    properties: SceneJsonExporterDataProperties;
    ui?: NodeJsonExporterUIData;
}
export declare class SceneDataManifestImporter {
    static import_scene_data(import_data: ImportData): Promise<SceneJsonExporterData>;
    static assemble(assemble_data: SceneDataElements, manifest_nodes: string[], json_by_name: Dictionary<object>): Promise<SceneJsonExporterData>;
    private static insert_child_data;
}
export {};

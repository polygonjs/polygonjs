import { PolyScene } from '../../../scene/PolyScene';
import { NodeJsonExporterData, NodeJsonExporterUIData } from './Node';
export interface SceneJsonExporterData {
    properties?: {
        frame: number;
        frame_range: Number2;
        frame_range_locked: Boolean2;
        master_camera_node_path: string | null;
    };
    root?: NodeJsonExporterData;
    ui?: NodeJsonExporterUIData;
}
export declare class SceneJsonExporter {
    private _scene;
    private _data;
    constructor(_scene: PolyScene);
    data(): SceneJsonExporterData;
    static sanitize_string(word: string): string;
}

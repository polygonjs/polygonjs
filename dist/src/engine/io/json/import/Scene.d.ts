import { PolyScene } from '../../../scene/PolyScene';
import { SceneJsonExporterData } from '../export/Scene';
export declare class SceneJsonImporter {
    private _data;
    constructor(_data: SceneJsonExporterData);
    static load_data(data: SceneJsonExporterData): Promise<PolyScene>;
    scene(): Promise<PolyScene>;
}

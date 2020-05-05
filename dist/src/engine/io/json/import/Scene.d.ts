import { PolyScene } from '../../../scene/PolyScene';
import { SceneJsonExporterData } from '../export/Scene';
import { ImportReport } from './ImportReport';
export declare class SceneJsonImporter {
    private _data;
    readonly report: ImportReport;
    constructor(_data: SceneJsonExporterData);
    static load_data(data: SceneJsonExporterData): Promise<PolyScene>;
    scene(): Promise<PolyScene>;
}

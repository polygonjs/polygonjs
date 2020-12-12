import { NodeJsonImporter } from '../Node';
import { NodeJsonExporterData } from '../../export/Node';
import { SceneJsonImporter } from '../Scene';
export declare class PolyNodeJsonImporter extends NodeJsonImporter<any> {
    create_nodes(scene_importer: SceneJsonImporter, data: Dictionary<NodeJsonExporterData>): void;
}

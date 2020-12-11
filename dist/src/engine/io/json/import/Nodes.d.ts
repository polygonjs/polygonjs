import { TypedNode } from '../../../nodes/_Base';
import { SceneJsonImporter } from '../../../io/json/import/Scene';
import { NodeContext } from '../../../poly/NodeContext';
import { NodeJsonExporterData } from '../export/Node';
declare type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;
export declare class NodesJsonImporter<T extends BaseNodeTypeWithIO> {
    protected _node: T;
    constructor(_node: T);
    process_data(scene_importer: SceneJsonImporter, data?: Dictionary<NodeJsonExporterData>): void;
}
export {};

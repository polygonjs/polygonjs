import { PolyScene } from '../PolyScene';
import { Object3D } from 'three/src/core/Object3D';
import { ObjectsManagerNode } from '../../nodes/manager/ObjectsManager';
import { BaseNodeType } from '../../nodes/_Base';
import { NodeContext } from '../../poly/NodeContext';
export declare class NodesController {
    private scene;
    constructor(scene: PolyScene);
    _root: ObjectsManagerNode;
    _node_context_signatures: Dictionary<boolean>;
    _instanciated_nodes_by_context_and_type: Dictionary<Dictionary<Dictionary<BaseNodeType>>>;
    init(): void;
    get root(): ObjectsManagerNode;
    objects_from_mask(mask: string): Object3D[];
    clear(): void;
    node(path: string): ObjectsManagerNode | BaseNodeType | null;
    all_nodes(): BaseNodeType[];
    reset_node_context_signatures(): void;
    register_node_context_signature(node: BaseNodeType): void;
    node_context_signatures(): string[];
    add_to_instanciated_node(node: BaseNodeType): void;
    remove_from_instanciated_node(node: BaseNodeType): void;
    instanciated_nodes(context: NodeContext, node_type: string): BaseNodeType[];
}

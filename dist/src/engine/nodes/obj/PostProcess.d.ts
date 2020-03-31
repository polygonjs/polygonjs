import { BaseManagerObjNode } from './_BaseManager';
import { NodeContext } from '../../poly/NodeContext';
export declare class PostProcessObjNode extends BaseManagerObjNode {
    static type(): string;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
}

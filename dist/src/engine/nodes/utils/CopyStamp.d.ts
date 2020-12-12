import { CoreGraphNode } from '../../../core/graph/CoreGraphNode';
import { PolyScene } from '../../scene/PolyScene';
export declare class BaseCopyStamp extends CoreGraphNode {
    protected _global_index: number;
    constructor(scene: PolyScene);
    set_global_index(index: number): void;
    value(attrib_name?: string): AttribValue;
}

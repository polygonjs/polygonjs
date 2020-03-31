import { CorePoint } from '../../../../core/geometry/Point';
import { CoreGraphNode } from '../../../../core/graph/CoreGraphNode';
import { PolyScene } from '../../../scene/PolyScene';
export declare class CopyStamp extends CoreGraphNode {
    private _global_index;
    private _point;
    constructor(scene: PolyScene);
    set_point(point: CorePoint): void;
    set_global_index(index: number): void;
    value(attrib_name?: string): any;
}

import { CoreGraphNode } from '../../../core/graph/CoreGraphNode';
import { BaseParamType } from '../_Base';
import { PolyScene } from '../../scene/PolyScene';
export declare class UIData extends CoreGraphNode {
    private param;
    private _update_visibility_and_remove_dirty_bound;
    constructor(scene: PolyScene, param: BaseParamType);
    update_visibility_and_remove_dirty(): void;
    update_visibility(): void;
}

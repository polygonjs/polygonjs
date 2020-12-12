import { CoreGraphNode } from '../../../core/graph/CoreGraphNode';
import { BaseNodeType } from '../_Base';
export declare class DisplayFlagGraphNode extends CoreGraphNode {
    protected _owner: BaseNodeType;
    private _owner_post_display_flag_node_set_dirty_bound;
    constructor(_owner: BaseNodeType);
    _owner_post_display_flag_node_set_dirty(): void;
}

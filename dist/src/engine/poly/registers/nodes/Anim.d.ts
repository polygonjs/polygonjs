import { NullAnimNode } from '../../../nodes/anim/Null';
import { MergeAnimNode } from '../../../nodes/anim/Merge';
import { TrackAnimNode } from '../../../nodes/anim/Track';
import { TransformAnimNode } from '../../../nodes/anim/Transform';
export interface AnimNodeChildrenMap {
    merge: MergeAnimNode;
    null: NullAnimNode;
    track: TrackAnimNode;
    transform: TransformAnimNode;
}
import { Poly } from '../../../Poly';
export declare class AnimRegister {
    static run(poly: Poly): void;
}

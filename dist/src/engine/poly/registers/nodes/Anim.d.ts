import { CopyAnimNode } from '../../../nodes/anim/Copy';
import { DelayAnimNode } from '../../../nodes/anim/Delay';
import { DurationAnimNode } from '../../../nodes/anim/Duration';
import { EasingAnimNode } from '../../../nodes/anim/Easing';
import { MergeAnimNode } from '../../../nodes/anim/Merge';
import { NullAnimNode } from '../../../nodes/anim/Null';
import { OperationAnimNode } from '../../../nodes/anim/Operation';
import { PositionAnimNode } from '../../../nodes/anim/Position';
import { PropertyAnimNode } from '../../../nodes/anim/Property';
import { RepeatAnimNode } from '../../../nodes/anim/Repeat';
import { SwitchAnimNode } from '../../../nodes/anim/Switch';
import { TargetAnimNode } from '../../../nodes/anim/Target';
export interface AnimNodeChildrenMap {
    copy: CopyAnimNode;
    delay: DelayAnimNode;
    duration: DurationAnimNode;
    easing: EasingAnimNode;
    merge: MergeAnimNode;
    null: NullAnimNode;
    operation: OperationAnimNode;
    position: PositionAnimNode;
    property: PropertyAnimNode;
    repeat: RepeatAnimNode;
    switch: SwitchAnimNode;
    target: TargetAnimNode;
}
import { Poly } from '../../../Poly';
export declare class AnimRegister {
    static run(poly: Poly): void;
}

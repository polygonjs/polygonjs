import { AnimationEventNode } from '../../../nodes/event/Animation';
import { AnyEventNode } from '../../../nodes/event/Any';
import { ButtonEventNode } from '../../../nodes/event/Button';
import { CameraMapControlsEventNode } from '../../../nodes/event/CameraMapControls';
import { CameraOrbitControlsEventNode } from '../../../nodes/event/CameraOrbitControls';
import { CodeEventNode } from '../../../nodes/event/Code';
import { KeyboardEventNode } from '../../../nodes/event/Keyboard';
import { LimitEventNode } from '../../../nodes/event/Limit';
import { MouseEventNode } from '../../../nodes/event/Mouse';
import { NodeCookEventNode } from '../../../nodes/event/NodeCook';
import { NullEventNode } from '../../../nodes/event/Null';
import { RaycastEventNode } from '../../../nodes/event/Raycast';
import { SceneEventNode } from '../../../nodes/event/Scene';
import { SetFlagEventNode } from '../../../nodes/event/SetFlag';
import { SetParamEventNode } from '../../../nodes/event/SetParam';
import { SequenceEventNode } from '../../../nodes/event/Sequence';
import { TimerEventNode } from '../../../nodes/event/Timer';
import { ViewerEventNode } from '../../../nodes/event/Viewer';
export interface EventNodeChildrenMap {
    animation: AnimationEventNode;
    any: AnyEventNode;
    button: ButtonEventNode;
    camera_orbit_controls: CameraMapControlsEventNode;
    camera_map_controls: CameraOrbitControlsEventNode;
    code: CodeEventNode;
    keyboard: KeyboardEventNode;
    limit: LimitEventNode;
    mouse: MouseEventNode;
    node_cook: NodeCookEventNode;
    null: NullEventNode;
    raycast: RaycastEventNode;
    scene: SceneEventNode;
    set_flag: SetFlagEventNode;
    set_param: SetParamEventNode;
    sequence: SequenceEventNode;
    timer: TimerEventNode;
    viewer: ViewerEventNode;
}
import { Poly } from '../../../Poly';
export declare class EventRegister {
    static run(poly: Poly): void;
}

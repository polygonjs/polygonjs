import { AnimationEventNode } from '../../../nodes/event/Animation';
import { AnyEventNode } from '../../../nodes/event/Any';
import { ButtonEventNode } from '../../../nodes/event/Button';
import { CameraDeviceOrientationControlsEventNode } from '../../../nodes/event/CameraDeviceOrientationControls';
import { CameraMapControlsEventNode } from '../../../nodes/event/CameraMapControls';
import { CameraNavigationBeaconsEventNode } from '../../../nodes/event/CameraNavigationBeacons';
import { CameraOrbitControlsEventNode } from '../../../nodes/event/CameraOrbitControls';
import { KeyboardEventNode } from '../../../nodes/event/Keyboard';
import { LimitEventNode } from '../../../nodes/event/Limit';
import { MessageEventNode } from '../../../nodes/event/Message';
import { MouseEventNode } from '../../../nodes/event/Mouse';
import { NodeCookEventNode } from '../../../nodes/event/NodeCook';
import { NullEventNode } from '../../../nodes/event/Null';
import { PointerEventNode } from '../../../nodes/event/Pointer';
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
    camera_device_orientation_controls: CameraDeviceOrientationControlsEventNode;
    camera_map_controls: CameraOrbitControlsEventNode;
    camera_navigation_beacons: CameraNavigationBeaconsEventNode;
    camera_orbit_controls: CameraMapControlsEventNode;
    keyboard: KeyboardEventNode;
    limit: LimitEventNode;
    message: MessageEventNode;
    mouse: MouseEventNode;
    node_cook: NodeCookEventNode;
    null: NullEventNode;
    pointer: PointerEventNode;
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

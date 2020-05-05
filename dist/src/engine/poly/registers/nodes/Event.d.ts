import { AnimationMultiCacheEventNode } from '../../../nodes/event/AnimationMultiCache';
import { AnyEventNode } from '../../../nodes/event/Any';
import { CameraMapControlsEventNode } from '../../../nodes/event/CameraMapControls';
import { CameraOrbitControlsEventNode } from '../../../nodes/event/CameraOrbitControls';
import { CodeEventNode } from '../../../nodes/event/Code';
import { KeyboardEventNode } from '../../../nodes/event/Keyboard';
import { MouseEventNode } from '../../../nodes/event/Mouse';
import { RaycastEventNode } from '../../../nodes/event/Raycast';
import { SceneEventNode } from '../../../nodes/event/Scene';
import { SetParamEventNode } from '../../../nodes/event/SetParam';
export interface EventNodeChildrenMap {
    animation_multi_cache: AnimationMultiCacheEventNode;
    any: AnyEventNode;
    camera_orbit_controls: CameraMapControlsEventNode;
    camera_map_controls: CameraOrbitControlsEventNode;
    code: CodeEventNode;
    keyboard: KeyboardEventNode;
    mouse: MouseEventNode;
    raycast: RaycastEventNode;
    scene: SceneEventNode;
    set_param: SetParamEventNode;
}
import { Poly } from '../../../Poly';
export declare class EventRegister {
    static run(poly: Poly): void;
}

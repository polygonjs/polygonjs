import { Camera } from 'three/src/cameras/Camera';
import { MapControls } from '../../../modules/core/controls/OrbitControls';
import { CameraControlsNodeType } from '../../poly/NodeContext';
import { CameraOrbitControlsEventNode } from './CameraOrbitControls';
export declare class CameraMapControlsEventNode extends CameraOrbitControlsEventNode {
    static type(): CameraControlsNodeType;
    create_controls_instance(camera: Camera, element: HTMLElement): Promise<MapControls>;
}

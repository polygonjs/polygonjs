import { Camera } from 'three/src/cameras/Camera';
import { MapControls } from '../../../../modules/three/examples/jsm/controls/OrbitControls';
import { CameraOrbitControlsEventNode } from './CameraOrbitControls';
export declare class CameraMapControlsEventNode extends CameraOrbitControlsEventNode {
    static type(): string;
    create_controls_instance(camera: Camera, element: HTMLElement): Promise<MapControls>;
}

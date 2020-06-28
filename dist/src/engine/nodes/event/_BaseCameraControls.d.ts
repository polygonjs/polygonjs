import { Camera } from 'three/src/cameras/Camera';
import { TypedEventNode } from './_Base';
import { OrbitControls } from '../../../../modules/three/examples/jsm/controls/OrbitControls';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export interface CameraControls extends OrbitControls {
    name?: string;
}
export declare abstract class TypedCameraControlsEventNode<K extends NodeParamsConfig> extends TypedEventNode<K> {
    apply_controls(camera: Camera, html_element: HTMLElement): Promise<CameraControls>;
    controls_id(): string;
    abstract update_required(): boolean;
    abstract setup_controls(controls: CameraControls): void;
    abstract create_controls_instance(camera: Camera, element: HTMLElement): Promise<CameraControls>;
}
export declare type BaseCameraControlsEventNodeType = TypedCameraControlsEventNode<any>;

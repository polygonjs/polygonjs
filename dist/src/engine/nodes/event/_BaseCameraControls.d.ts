import { Camera } from 'three/src/cameras/Camera';
import { TypedEventNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare type CameraControls = any;
export declare abstract class TypedCameraControlsEventNode<K extends NodeParamsConfig> extends TypedEventNode<K> {
    apply_controls(camera: Camera, html_element: HTMLElement): Promise<any>;
    controls_id(): string;
    abstract update_required(): boolean;
    abstract setup_controls(controls: CameraControls): void;
    abstract dispose_controls_for_html_element_id(html_element_id: string): void;
    abstract create_controls_instance(camera: Camera, element: HTMLElement): Promise<CameraControls>;
}
export declare type BaseCameraControlsEventNodeType = TypedCameraControlsEventNode<any>;

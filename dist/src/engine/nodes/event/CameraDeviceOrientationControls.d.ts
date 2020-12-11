import { Camera } from 'three/src/cameras/Camera';
import { TypedCameraControlsEventNode, CameraControls } from './_BaseCameraControls';
import { DeviceOrientationControls } from '../../../modules/three/examples/jsm/controls/DeviceOrientationControls';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CameraControlsNodeType } from '../../poly/NodeContext';
declare class CameraDeviceOrientationControlsEventParamsConfig extends NodeParamsConfig {
}
export declare class CameraDeviceOrientationControlsEventNode extends TypedCameraControlsEventNode<CameraDeviceOrientationControlsEventParamsConfig> {
    params_config: CameraDeviceOrientationControlsEventParamsConfig;
    static type(): CameraControlsNodeType;
    private _controls_by_element_id;
    create_controls_instance(camera: Camera, element: HTMLElement): Promise<DeviceOrientationControls>;
    setup_controls(controls: CameraControls): void;
    update_required(): boolean;
    dispose_controls_for_html_element_id(html_element_id: string): void;
}
export {};

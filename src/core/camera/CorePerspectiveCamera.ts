import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {PolyEngine} from '../../engine/Poly';
import {CameraNodeType} from '../../engine/poly/NodeContext';
import {ViewerCallbackOptions} from '../../engine/poly/registers/cameras/PolyCamerasRegister';
import {OnNodeRegisterCallback} from '../../engine/poly/registers/nodes/NodesRegister';
import {ThreejsViewer} from '../../engine/viewers/Threejs';
import {Constructor, Number2} from '../../types/GlobalTypes';
import {CoreCameraPerspectiveFrameMode} from './frameMode/CoreCameraPerspectiveFrameMode';
// @ts-ignore
import {PhysicalCamera} from 'three-gpu-pathtracer';

interface PerspectiveCameraDefault {
	fov: number;
	fovRange: Number2;
}
export const PERSPECTIVE_CAMERA_DEFAULT: PerspectiveCameraDefault = {
	fov: 50,
	fovRange: [0.001, 180],
};

export function PerspectiveCameraParamConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param field of view */
		fov = ParamConfig.FLOAT(PERSPECTIVE_CAMERA_DEFAULT.fov, {range: PERSPECTIVE_CAMERA_DEFAULT.fovRange});
	};
}

export const registerPerspectiveCamera: OnNodeRegisterCallback = (poly: PolyEngine) => {
	poly.registerCameraNodeType(CameraNodeType.PERSPECTIVE);
	poly.registerCamera<PhysicalCamera>(PhysicalCamera, (options: ViewerCallbackOptions<PhysicalCamera>) => {
		const viewer = new ThreejsViewer<PhysicalCamera>({
			...options,
			updateCameraAspect: (aspect) => {
				CoreCameraPerspectiveFrameMode.updateCameraAspect(options.camera, aspect);
			},
		});
		return viewer;
	});
};

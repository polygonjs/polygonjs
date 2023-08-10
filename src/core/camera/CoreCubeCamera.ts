import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {PolyEngine} from '../../engine/Poly';
import {OnNodeRegisterCallback} from '../../engine/poly/registers/nodes/NodesRegister';
import {Constructor, Number2} from '../../types/GlobalTypes';
// import {CameraNodeType} from '../../engine/poly/NodeContext';
// import {ViewerCallbackOptions} from '../../engine/poly/registers/cameras/PolyCamerasRegister';
// import {ThreejsViewer} from '../../engine/viewers/Threejs';
// import {CoreCameraPerspectiveFrameMode} from './frameMode/CoreCameraPerspectiveFrameMode';
// import {CubeCamera} from 'three';

interface CubeCameraDefault {
	resolution: number;
	resolutionRange: Number2;
}
export const CUBE_CAMERA_DEFAULT: CubeCameraDefault = {
	resolution: 1024,
	resolutionRange: [8, 2048],
};

export function CubeCameraParamConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param resolution */
		resolution = ParamConfig.FLOAT(CUBE_CAMERA_DEFAULT.resolution, {range: CUBE_CAMERA_DEFAULT.resolutionRange});
	};
}

export const registerCubeCamera: OnNodeRegisterCallback = (poly: PolyEngine) => {
	// poly.registerCameraNodeType(CameraNodeType.CUBE);
	// poly.registerCamera<CubeCamera>(CubeCamera, (options: ViewerCallbackOptions<CubeCamera>) => {
	// 	const viewer = new ThreejsViewer<CubeCamera>({
	// 		...options,
	// 		updateCameraAspect: (aspect) => {
	// 			CoreCameraPerspectiveFrameMode.updateCameraAspect(options.camera, aspect);
	// 		},
	// 	});
	// 	return viewer;
	// });
};

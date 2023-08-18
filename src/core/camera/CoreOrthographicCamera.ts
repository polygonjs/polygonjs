import {OrthographicCamera, Vector2} from 'three';
import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {PolyEngine} from '../../engine/Poly';
import {CameraNodeType} from '../../engine/poly/NodeContext';
import {ViewerCallbackOptions} from '../../engine/poly/registers/cameras/PolyCamerasRegister';
import {OnNodeRegisterCallback} from '../../engine/poly/registers/nodes/NodesRegister';
import {ThreejsViewer} from '../../engine/viewers/Threejs';
import {Constructor} from '../../types/GlobalTypes';
import {CoreCameraOrthographicFrameMode} from './frameMode/CoreCameraOrthographicFrameMode';

export const ORTHOGRAPHIC_CAMERA_DEFAULT = {
	left: -0.5,
	right: 0.5,
	top: 0.5,
	bottom: -0.5,
};

export function OrthographicCameraParamConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param size */
		size = ParamConfig.FLOAT(1);
	};
}

export const registerOrthographicCamera: OnNodeRegisterCallback = (poly: PolyEngine) => {
	poly.registerCameraNodeType(CameraNodeType.ORTHOGRAPHIC);

	poly.registerCamera<OrthographicCamera>(
		OrthographicCamera,
		(options: ViewerCallbackOptions<OrthographicCamera>) => {
			const viewer = new ThreejsViewer<OrthographicCamera>({
				...options,
				updateCameraAspect: (aspect, resolution: Vector2) => {
					CoreCameraOrthographicFrameMode.updateCameraAspect(options.camera, aspect, {resolution});
				},
			});
			return viewer;
		}
	);
};

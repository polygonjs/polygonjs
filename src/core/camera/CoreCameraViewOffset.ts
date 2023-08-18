import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor} from '../../types/GlobalTypes';
import {Camera, Vector2, PerspectiveCamera, OrthographicCamera} from 'three';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';

export function CoreCameraViewOffsetParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param min */
		min = ParamConfig.VECTOR2([0, 0]);
		/** @param max */
		max = ParamConfig.VECTOR2([1, 1]);
	};
}

function cameraViewOffsetMin(camera: Camera, target: Vector2) {
	target.set(0, 0);
	CoreObject.attribValue(camera, CameraAttribute.VIEW_OFFSET_MIN, 0, target);
}
function cameraViewOffsetMax(camera: Camera, target: Vector2) {
	target.set(1, 1);
	CoreObject.attribValue(camera, CameraAttribute.VIEW_OFFSET_MAX, 0, target);
}
const _min = new Vector2();
const _max = new Vector2();
export function cameraSetViewOffset(camera: PerspectiveCamera | OrthographicCamera, resolution: Vector2) {
	const hasMin = CoreObject.hasAttrib(camera, CameraAttribute.VIEW_OFFSET_MIN);
	const hasMax = CoreObject.hasAttrib(camera, CameraAttribute.VIEW_OFFSET_MAX);
	if (!(hasMin && hasMax)) {
		return;
	}
	cameraViewOffsetMin(camera, _min);
	cameraViewOffsetMax(camera, _max);
	camera.setViewOffset(
		resolution.x,
		resolution.y,
		_min.x * resolution.x,
		_min.y * resolution.y,
		_max.x * resolution.x,
		_max.y * resolution.y
	);
}

import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor} from '../../types/GlobalTypes';
import {Camera, Vector2, PerspectiveCamera, OrthographicCamera} from 'three';
import {CameraAttribute} from './CoreCamera';
import {coreObjectClassFactory, BaseCoreObjectClass} from '../geometry/CoreObjectFactory';

export function CoreCameraViewOffsetParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param min */
		min = ParamConfig.VECTOR2([0, 0]);
		/** @param max */
		max = ParamConfig.VECTOR2([1, 1]);
	};
}

function cameraViewOffsetMin(coreObjectClass: typeof BaseCoreObjectClass, camera: Camera, target: Vector2) {
	target.set(0, 0);
	coreObjectClass.attribValue(camera, CameraAttribute.VIEW_OFFSET_MIN, 0, target);
}
function cameraViewOffsetMax(coreObjectClass: typeof BaseCoreObjectClass, camera: Camera, target: Vector2) {
	target.set(1, 1);
	coreObjectClass.attribValue(camera, CameraAttribute.VIEW_OFFSET_MAX, 0, target);
}
const _min = new Vector2();
const _max = new Vector2();
export function cameraSetViewOffset(camera: PerspectiveCamera | OrthographicCamera, resolution: Vector2) {
	const coreObjectClass = coreObjectClassFactory(camera);
	const hasMin = coreObjectClass.hasAttribute(camera, CameraAttribute.VIEW_OFFSET_MIN);
	const hasMax = coreObjectClass.hasAttribute(camera, CameraAttribute.VIEW_OFFSET_MAX);
	if (!(hasMin && hasMax)) {
		return;
	}
	cameraViewOffsetMin(coreObjectClass, camera, _min);
	cameraViewOffsetMax(coreObjectClass, camera, _max);
	camera.setViewOffset(
		resolution.x,
		resolution.y,
		_min.x * resolution.x,
		_min.y * resolution.y,
		_max.x * resolution.x,
		_max.y * resolution.y
	);
}

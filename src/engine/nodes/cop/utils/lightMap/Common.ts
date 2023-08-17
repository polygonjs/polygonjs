import {Material, Object3D, Matrix4, Vector3} from 'three';
import {CoreUserAgent} from '../../../../../core/UserAgent';
import {HalfFloatType, FloatType, RGBAFormat} from 'three';

export interface ObjectState {
	material: Material | Material[];
	frustumCulled: boolean;
	parent: Object3D | null;
	renderOrder: number;
	// castShadow: boolean;
	// receiveShadow: boolean;
	// inverted: boolean;
}
export interface LightHierarchyState {
	matrixAutoUpdate: boolean;
	parent: Object3D | null;
}
export interface LightMatrixState {
	matrix: Matrix4;
	position: Vector3;
}

export interface LightMapControllerParams {
	resolution: number;
	lightRadius: number;
	totalIterationsCount: number;
	// iterationBlend: number;
	blur: boolean;
	blurAmount: number;
}
// export const DEFAULT_ITERATION_BLEND = 1 / 200;
const isAndroidOriOS = CoreUserAgent.isAndroid() || CoreUserAgent.isiOS();
export const renderTargetType = isAndroidOriOS ? HalfFloatType : FloatType;
export const renderTargetFormat = RGBAFormat;
export const RENDER_TARGET_DEFAULT_SIZE = 1;

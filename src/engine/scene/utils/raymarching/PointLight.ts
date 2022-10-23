import {Vector3, IUniform} from 'three';
import {WorldPosUniformElement, PenumbraUniformElement} from './_Base';

export interface PointLightRayMarchingUniformElement extends WorldPosUniformElement, PenumbraUniformElement {}
interface PointLightRayMarchingUniforms extends Array<PointLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
export interface PointLightRayMarchingUniform extends IUniform {
	value: PointLightRayMarchingUniforms;
}
export function _createPointLightUniform(): PointLightRayMarchingUniformElement {
	return {
		worldPos: new Vector3(),
		penumbra: 0,
	};
}

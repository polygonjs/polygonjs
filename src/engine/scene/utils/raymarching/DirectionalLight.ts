import {Vector3, IUniform} from 'three';
import {DirectionUniformElement, PenumbraUniformElement} from './_Base';

export interface DirectionalLightRayMarchingUniformElement extends DirectionUniformElement, PenumbraUniformElement {}
interface DirectionalLightRayMarchingUniforms extends Array<DirectionalLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
export interface DirectionalLightRayMarchingUniform extends IUniform {
	value: DirectionalLightRayMarchingUniforms;
}
export function _createDirectionalLightUniform(): DirectionalLightRayMarchingUniformElement {
	return {
		direction: new Vector3(),
		penumbra: 0,
	};
}

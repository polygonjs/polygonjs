import {Vector3, IUniform} from 'three';
import {DirectionUniformElement} from './_Base';

export interface HemisphereLightRayMarchingUniformElement extends DirectionUniformElement {}
interface HemisphereLightRayMarchingUniforms extends Array<HemisphereLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
export interface HemisphereLightRayMarchingUniform extends IUniform {
	value: HemisphereLightRayMarchingUniforms;
}
export function _createHemisphereLightUniform(): HemisphereLightRayMarchingUniformElement {
	return {
		direction: new Vector3(),
	};
}

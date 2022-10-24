import {Vector3, IUniform, HemisphereLight} from 'three';
import {DirectionUniformElement, UniformsUpdateFunction, updateDirectionFromMatrix} from './_Base';

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

let hemisphereLightIndex = 0;
export const _updateUniformsWithHemisphereLight: UniformsUpdateFunction<HemisphereLight> = (
	object: HemisphereLight,
	hemisphereLightsRayMarching: HemisphereLightRayMarchingUniform
) => {
	updateDirectionFromMatrix(object, hemisphereLightsRayMarching, hemisphereLightIndex, _createHemisphereLightUniform);
	hemisphereLightIndex++;
};
export function _resetHemisphereLightIndex() {
	hemisphereLightIndex = 0;
}
